import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import urljoin = require('url-join');

import Course from '../../models/Course';
import MinimalLecture from '../../models/MinimalLecture';
import {
  fetchHTML,
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

  const lecturesURL = urljoin(courseObj.data.url, 'video-lectures/');
  const document = await fetchHTML(lecturesURL);
  let lectures: MinimalLecture[] = [];
  document.querySelectorAll('#course_inner_media_gallery > .medialisting').forEach((lectureElement, lectureIndex) => {
    const url = parseURL(lectureElement.querySelector('a')?.getAttribute('href') || '');
    const thumbnailURL = parseURL(lectureElement.querySelector('a')?.getAttribute('src') || '');
    const title = removeUselessWhitespace(lectureElement.querySelector('.mediatitle')?.textContent || '');
    if ([url, thumbnailURL, title].filter((e) => e.length === 0).length === 0) {
      const lectureObj = new MinimalLecture({
        url,
        thumbnailURL,
        title,
        lectureIndex,
        courseID,
      });
      lectures.push(lectureObj);
    }
  });

  response.json(lectures.map((e) => e.toJSON()));
});
