import * as functions from 'firebase-functions';
import urljoin = require('url-join');

import Lecture from '../../models/Lecture';
import {
  fetchHTML,
  getInnermostParent,
  parseURL,
} from '../../util';

export const getLectures = functions.https.onRequest(async (request, response) => {
  let { url, title, thumbnailURL, courseID } = request.query;
  if (!url || !title || !request.query.lectureIndex || !thumbnailURL) {
    response.status(404).json({
      message: 'Lecture not found or insufficient parameters provided',
    });
    return;
  }

  const lectureIndex = parseInt(request.query.lectureIndex.toString()) || 0;
  url = url.toString();
  title = title.toString();
  thumbnailURL = thumbnailURL.toString();

  let lecture: Lecture;
  let lectureNotesURL;
  let aboutHTML;

  // Fetches instructors list, which is not currently part of Lecture objects.
  // let instructors;
  // instructors = Array.from(document.querySelectorAll('meta[name="Author"]'))
  //   .map((e) => removeUselessWhitespace(e.getAttribute('content') || ''))
  //   .filter((e) => e.length > 0);

  {
    const document = await fetchHTML(url);

    const aboutParentElement = document.querySelector('#vid_about');
    if (aboutParentElement) {
      const aboutInnermostParentElement: any = getInnermostParent(aboutParentElement);
      if (aboutInnermostParentElement.innerHTML) {
        aboutHTML = aboutInnermostParentElement.innerHTML;
      } else {
        aboutHTML = aboutInnermostParentElement.textContent;
      }
    } else {
      aboutHTML = document.querySelector('meta[name="Description"]')?.getAttribute('content') || 'No description for this lecture was provided.';
    }

    lectureNotesURL = '';
    try {
      const lectureNotesIndexURL = urljoin(url, 'lecture-notes/');
      const lectureNotesIndexDocument = await fetchHTML(lectureNotesIndexURL);
      const lectureNotesPath = lectureNotesIndexDocument
        .querySelectorAll('#course_inner_section .maintabletemplate a')
        [lectureIndex].getAttribute('href');
      if (!lectureNotesPath) return;
      lectureNotesURL = parseURL(lectureNotesPath);
    } catch (err) {}
  }

  lecture = new Lecture({
    url,
    title,
    courseID,
    lectureIndex,
    aboutHTML,
    thumbnailURL,
    lectureNotesURL,
  });

  response.json(lecture.toJSON());
});
