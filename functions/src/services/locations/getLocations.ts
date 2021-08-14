import * as functions from 'firebase-functions';

import { Cache } from '../../util';

export const getLocations = functions.https.onRequest(async (request, response) => {
  response.json(await Cache.fetchFromCache('locations'));
});
