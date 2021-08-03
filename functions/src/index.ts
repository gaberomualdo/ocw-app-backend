import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import serviceAccount from './config/serviceAccountKey';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export * from './services/courses/';
export * from './services/instructors/';
export * from './services/lectures/';
export * from './services/locations/';

export const isAlive = functions.https.onRequest((request, response) => {
  response.json({
    message: 'Firebase functions are running!',
  });
});
