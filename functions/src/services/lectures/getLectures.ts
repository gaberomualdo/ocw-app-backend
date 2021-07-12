import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();
const firestore = admin.firestore();

export const getLectures = functions.https.onRequest(async (request, response) => {
  const { courseID } = request.query;
  const query = firestore.collection('lectures').where('courseID', '==', courseID);
  const snapshot = await query.get();
  const lectures = snapshot.forEach((doc) => doc.data());
  response.send(lectures);
});
