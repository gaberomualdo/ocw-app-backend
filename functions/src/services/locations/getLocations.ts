import * as functions from 'firebase-functions';

import { getAllFromFirestore } from '../../util';

export const getLocations = functions.https.onRequest(async (request, response) => {
  const locations = {};
  const courses = await getAllFromFirestore('courses');
  courses.forEach((course) => {
    const courseLocation = course.data().location;
  });

  response.send(locations);
});
