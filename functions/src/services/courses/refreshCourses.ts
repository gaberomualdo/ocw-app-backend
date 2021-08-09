import * as functions from 'firebase-functions';

import Course from '../../models/Course';
import {
  fetchHTML,
  fetchJSON,
  GenericObject,
  parseURL,
  removeUselessWhitespace,
} from '../../util';
import {
  SITE_BASEURL,
  SITE_TOPICS_ROUTE,
} from '../../util/constants';

const allSettled = require('promise.allsettled');
const urljoin = require('url-join');

const REQUESTS_PER_BATCH = 30;
const REQUESTS_MAX_TRIES = 10; // stop trying to request a particular course after this many times

const getCourseFromJSON = async (course: GenericObject) => {
  const courseURL = urljoin(SITE_BASEURL, course.href);
  const document = await fetchHTML(courseURL);
  const imageCaption = document.querySelector('#chpImage p')?.textContent || '';

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
  let description: string;
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
    description = textSections['Course Description'].map((e) => e.textContent).join('\n\n');
    textSections['Course Features'].forEach((e: any) => {
      e.querySelectorAll('a').forEach((link: HTMLElement) => {
        const rawURL = link.getAttribute('href');
        const name = link.textContent;
        if (!name || !rawURL) return;
        features.push({ name, url: parseURL(rawURL) });
      });
    });
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
    sortAs: course.sort_as,
  });
};

const _refreshCourses = async () => {
  let coursesJSON: GenericObject[] = [];
  const topics = await fetchJSON(urljoin(SITE_BASEURL, SITE_TOPICS_ROUTE, 'topics.json'));
  for (const { name, file } of topics) {
    const coursesInTopic = await fetchJSON(urljoin(SITE_BASEURL, SITE_TOPICS_ROUTE, file));
    coursesJSON = [...coursesJSON, ...coursesInTopic.map((e: GenericObject) => ({ requestTries: 0, topic: name, ...e }))];
  }

  functions.logger.log(`Found ${coursesJSON.length} courses.`);

  const resultingCourses: Course[] = [];
  {
    let targetCoursesCount = /* coursesJSON.length */ 10; // to speed up testing, enter a small value here
    while (resultingCourses.length < targetCoursesCount) {
      console.log(resultingCourses.length);
      const currentBatch = coursesJSON.slice(0, REQUESTS_PER_BATCH);
      const results = await allSettled(currentBatch.map((e) => getCourseFromJSON(e)));
      coursesJSON.splice(0, REQUESTS_PER_BATCH);
      results.forEach((result: GenericObject, idx: number) => {
        if (result.status === 'rejected') {
          // try again later for failed promises
          currentBatch[idx].requestTries++;
          if (currentBatch[idx].requestTries < REQUESTS_MAX_TRIES) {
            coursesJSON.push(currentBatch[idx]);
          } else {
            // surpassed max tries, stop trying to request this one
            targetCoursesCount--;
          }
        } else {
          resultingCourses.push(result.value);
        }
      });
      functions.logger.log(`Fetched ${resultingCourses.length} total courses so far.`);
    }
  }

  // save courses
  for (const course of resultingCourses) {
    await course.setIDToExistingCourseID();
    await course.save();
  }
};

export const refreshCoursesJob = functions.pubsub
  .schedule('0 8 * * *') // every day at 8am
  .timeZone('America/New_York')
  .onRun(async () => {
    await _refreshCourses();
    return null;
  });

export const refreshCourses = functions.https.onRequest(async (request, response) => {
  response.json({
    message: 'Command received succesfully',
  });
  await _refreshCourses();
});
