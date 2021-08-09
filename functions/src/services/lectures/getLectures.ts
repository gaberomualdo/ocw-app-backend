import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import urljoin = require('url-join');

import Course from '../../models/Course';
import MinimalLecture from '../../models/MinimalLecture';
import {
  fetchHTML,
  isLocalURL,
  parseURL,
  removeUselessWhitespace,
} from '../../util';

const firestore = admin.firestore();

export const getLectures = functions.https.onRequest(async (request, response) => {
  let { courseID } = request.query;
  if (!courseID) {
    response.status(404).json({
      message: 'Course not found',
    });
    return;
  }
  courseID = courseID.toString();
  const query = firestore.collection(Course.collectionName).doc(courseID);
  const course = await query.get();
  if (!course.exists) {
    response.status(404).json({
      message: 'Course not found',
    });
    return;
  }

  const courseObj = new Course(course.data() || {}, course.id);

  if (!courseObj.data.hasLectures) {
    response.status(404).json({
      message: 'Course does not have lectures',
    });
    return;
  }

  let lectures: MinimalLecture[] = [];
  const possibleLecturesPaths = ['video-lectures/', 'lecture-videos/', 'course-videos/', 'course-lectures/', 'lectures/', 'videos/'];
  const possibleLecturesURLs = possibleLecturesPaths.map((e) => urljoin(courseObj.data.url, e));
  const possibleLecturesFeatureNames = [
    'video lectures',
    'course videos',
    'course lectures',
    'lecture videos',
    'lecture video',
    'videos',
    'lectures',
    'video',
  ];
  courseObj.data.features.forEach((feature) => {
    feature.name = feature.name.toLowerCase();
    if (possibleLecturesFeatureNames.includes(feature.name)) {
      if (isLocalURL(feature.url)) {
        if (possibleLecturesURLs.includes(feature.url)) {
          possibleLecturesURLs.slice(possibleLecturesURLs.indexOf(feature.url), 1);
        } else {
          possibleLecturesURLs.push(feature.url);
        }
      }
    }
  });
  for (const lecturesURL of possibleLecturesURLs) {
    const document = await fetchHTML(lecturesURL);
    const lectureElements = document.querySelectorAll('#course_inner_media_gallery > .medialisting');
    lectureElements.forEach((lectureElement: any, lectureIndex: number) => {
      const url = lectureElement.querySelector('a')?.getAttribute('href') || '';
      const thumbnailURL = lectureElement.querySelector('img')?.getAttribute('src') || '';
      const title = removeUselessWhitespace(lectureElement.querySelector('.mediatitle')?.textContent || '');
      if ([url, title].filter((e) => e.length === 0).length === 0) {
        const lectureObj = new MinimalLecture({
          url: parseURL(url),
          // sddefault.jpg is YouTube's larger thumbnail
          thumbnailURL: thumbnailURL.length > 0 ? parseURL(thumbnailURL.replace('/default.jpg', '/sddefault.jpg')) : '',
          title,
          lectureIndex,
          courseID,
        });
        lectures.push(lectureObj);
      }
    });
    // this lecture path had the lectures, so move on and return
    if (lectureElements.length > 0) break;
  }

  response.json(lectures.map((e) => e.toJSON()));
});
