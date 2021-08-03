import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Use the below code to initialize with a service account
// import serviceAccount from './config/serviceAccountKey';
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

admin.initializeApp();

export * from './services/courses/';
export * from './services/instructors/';
export * from './services/lectures/';
export * from './services/locations/';
export * from './services/userInfo/';

export const isAlive = functions.https.onRequest((request, response) => {
  response.json({
    message: 'Firebase functions are running!',
  });
});
