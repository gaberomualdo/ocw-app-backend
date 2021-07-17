import * as functions from 'firebase-functions';

import { getAllFromFirestore } from '../../util';

export const getLocations = functions.https.onRequest(async (request, response) => {
  const locations = new Set();
  const courses = await getAllFromFirestore('courses');
  courses.forEach((course) => {
    const courseLocations = course.data().locations;
    courseLocations.forEach((location: any) => {
      locations.add(location);
    });
  });

  response.send(locations);
});
