import * as functions from 'firebase-functions';

export const isAlive = functions.https.onRequest((request, response) => {
  response.json({
    message: 'Firebase functions are running!',
  });
});
