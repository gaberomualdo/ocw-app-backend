import * as functions from 'firebase-functions';

import Course from '../../models/Course';
import {
  fetchHTML,
  fetchJSON,
  GenericObject,
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

  let description: string;
  {
    const descriptionParagraphs: string[] = [];
    let descriptionHeaderFound = false;
    let textElements = Array.from(document.querySelectorAll('[itemprop="description"] > div > *'));
    let item: any;
    for (item of textElements) {
      // break after a header after course description has been found
      if (descriptionHeaderFound && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(item.tagName)) break;

      if (descriptionHeaderFound && item.textContent) descriptionParagraphs.push(item.textContent);
      if (item.textContent?.includes('Course Description')) descriptionHeaderFound = true;
    }
    description = descriptionParagraphs.join('\n\n');
  }

  let tabs: Course['data']['tabs'] = [];
  document.querySelectorAll('#course_nav > ul > li').forEach((e: any) => {
    const link = e.querySelector('a:not([href="#"])');
    if (!link) return;
    const tab = {
      name: link.textContent?.trim() || '',
      url: link.getAttribute('href') || '',
    };
    if (tab.name.length === 0 || tab.url.length === 0) return;
    tabs.push(tab);
  });

  return new Course({
    url: courseURL,
    title: course.title,
    instructors,
    description,
    imageURL,
    imageCaption,
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
