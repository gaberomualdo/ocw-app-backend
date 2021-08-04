import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import {
  getNewID,
  saveToFirestore,
} from './util';

// Use the below code to initialize with a service account
const serviceAccount = require('./config/serviceAccountKey');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// admin.initializeApp();

export * from './services/courses/';
export * from './services/instructors/';
export * from './services/lectures/';
export * from './services/locations/';
export * from './services/userInfo/';
export * from './services/blog/';
export * from './services/radio/';

export const isAlive = functions.https.onRequest((request, response) => {
  const message = 'Firebase functions are running!';
  functions.logger.log(message);
  response.json({
    message,
  });
});

export const testFirestore = functions.https.onRequest((request, response) => {
  functions.logger.log('Attempting to save test item to Firestore');
  const itemID = getNewID();
  saveToFirestore('test-collection', itemID, {
    message: `Hello, world from item with ID: ${itemID}`,
  })
    .catch((err) => response.json(err))
    .then(() => response.json({ message: 'Success' }));
});
