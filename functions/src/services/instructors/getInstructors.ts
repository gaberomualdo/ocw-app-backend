import * as functions from 'firebase-functions';

import { Cache } from '../../util';

export const getInstructors = functions.https.onRequest(async (request, response) => {
  response.json(await Cache.fetchFromCache('instructors-map'));
});
