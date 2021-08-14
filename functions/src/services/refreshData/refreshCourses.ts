import * as functions from 'firebase-functions';

import Course from '../../models/Course';
import {
  fetchHTML,
  fetchJSON,
  GenericObject,
  parseKebabCase,
  parseURL,
  removeUselessWhitespace,
  toTitleCase,
} from '../../util';
import {
  SITE_BASEURL,
  SITE_TOPICS_ROUTE,
} from '../../util/constants';

const allSettled = require('promise.allsettled');
const urljoin = require('url-join');

const REQUESTS_PER_BATCH = 15;
const REQUESTS_MAX_TRIES = 10; // stop trying to request a particular course after this many times

const getCourseFromJSON = async (course: GenericObject) => {
  const courseURL = urljoin(SITE_BASEURL, course.href);
  const document = await fetchHTML(courseURL);
  const imageCaption = document.querySelector('#chpImage p')?.textContent || '';
  const department = toTitleCase(parseKebabCase(course.department));

  let imageURL = document.querySelector('#chpImage img')?.getAttribute('src');
  if (imageURL) {
    imageURL = urljoin(SITE_BASEURL, imageURL);
  } else {
    imageURL = '';
  }

  const instructors: string[] = Array.from(document.querySelectorAll('[itemprop="author"]'))
    .map((e: any) => removeUselessWhitespace(e.textContent || ''))
    .filter((e: string) => e.length > 0);

  // compile description and course features
  let description: string = '';
  let features: Course['data']['features'] = [];
  {
    const isHeader = (elm: any) => ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(elm.tagName);
    let textElements = Array.from(document.querySelectorAll('[itemprop="description"] > div > *'));
    let currentHeader: string = '';
    const textSections: { [header: string]: Node[] } = {};
    for (const item of textElements) {
      if (item.textContent) {
        if (isHeader(item)) {
          currentHeader = removeUselessWhitespace(item.textContent);
        } else {
          if (!textSections[currentHeader]) textSections[currentHeader] = [];
          textSections[currentHeader].push(item);
        }
      }
    }
    if (textSections['Course Description']) {
      description = textSections['Course Description'].map((e) => e.textContent).join('\n\n');
    }
    if (textSections['Course Features']) {
      textSections['Course Features'].forEach((e: any) => {
        e.querySelectorAll('a').forEach((link: HTMLElement) => {
          const rawURL = link.getAttribute('href');
          const name = link.textContent;
          if (!name || !rawURL) return;
          features.push({ name, url: parseURL(rawURL) });
        });
      });
    }
  }

  // compile tabs
  let tabs: Course['data']['tabs'] = [];
  document.querySelectorAll('#course_nav > ul > li').forEach((e: any) => {
    const link = e.querySelector('a:not([href="#"])');
    if (!link) return;
    const tabName = link.textContent?.trim() || '';
    const tabURL = link.getAttribute('href') || '';
    if (tabName.length === 0 || tabURL.length === 0) return;
    tabs.push({
      name: tabName,
      url: parseURL(tabURL),
    });
  });

  return new Course({
    url: courseURL,
    title: course.title,
    instructors,
    description,
    imageURL,
    imageCaption,
    features,
    tabs,
    hasLectures: course.completeVideo,
    semesterTaught: course.sem,
    level: course.level,
    locations: course.topics.map((e: GenericObject) => ({
      topic: course.topic,
      category: e.subCat,
      speciality: e.speciality,
    })),
    department,
    sortAs: course.sort_as,
  });
};

const saveCourseFromJSON = async (course: GenericObject) => {
  const courseObj = await getCourseFromJSON(course);
  await courseObj.setIDToExistingCourseID();
  await courseObj.save();
};

const refreshCourses = async () => {
  let coursesJSON: GenericObject[] = [];
  const topics = await fetchJSON(urljoin(SITE_BASEURL, SITE_TOPICS_ROUTE, 'topics.json'));
  for (const { name, file } of topics) {
    const coursesInTopic = await fetchJSON(urljoin(SITE_BASEURL, SITE_TOPICS_ROUTE, file));
    coursesJSON = [...coursesJSON, ...coursesInTopic.map((e: GenericObject) => ({ requestTries: 0, topic: name, ...e }))];
  }

  functions.logger.log(`Found ${coursesJSON.length} courses.`);
  {
    let coursesFetchedCount: number = 0;
    let targetCoursesCount = coursesJSON.length; // to speed up testing, enter a small value here
    while (coursesFetchedCount < targetCoursesCount) {
      const currentBatch = coursesJSON.slice(0, REQUESTS_PER_BATCH);
      const results = await allSettled(currentBatch.map((e) => saveCourseFromJSON(e)));
      coursesJSON.splice(0, REQUESTS_PER_BATCH);
      results.forEach((result: GenericObject, idx: number) => {
        if (result.status === 'rejected') {
          functions.logger.log(result.reason);
          // try again later for failed promises
          currentBatch[idx].requestTries++;
          if (currentBatch[idx].requestTries < REQUESTS_MAX_TRIES) {
            coursesJSON.push(currentBatch[idx]);
          } else {
            // surpassed max tries, stop trying to request this one
            targetCoursesCount--;
          }
        } else {
          coursesFetchedCount++;
        }
      });
      functions.logger.log(`Fetched ${coursesFetchedCount} total courses so far.`);
    }
  }
};
export default refreshCourses;
