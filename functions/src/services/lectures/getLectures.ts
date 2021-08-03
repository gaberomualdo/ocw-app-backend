import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import Lecture from '../../models/Lecture';

const firestore = admin.firestore();

export const getLectures = functions.https.onRequest(async (request, response) => {
  const { courseID } = request.query;
  if (!courseID) {
    response.json([]);
    return;
  }
  const query = firestore.collection('lectures').where('courseID', '==', courseID);
  const snapshot = await query.get();
  const lectures: Lecture['data'][] = [];
  snapshot.forEach((doc) => {
    const lecture = new Lecture(doc.data(), doc.id);
    lectures.push(lecture.toJSON());
  });
  response.json(lectures);
});
