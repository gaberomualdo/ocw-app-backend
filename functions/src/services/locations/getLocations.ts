import * as functions from 'firebase-functions';

import Course from '../../models/Course';
import {
  getAllFromFirestore,
  removeDuplicatesFromArray,
} from '../../util';

export const getLocations = functions.https.onRequest(async (request, response) => {
  let locationsAsJSONStrings: string[] = [];
  const courses = await getAllFromFirestore('courses');
  courses.forEach((course) => {
    const courseObj = new Course(course.data(), course.id);
    const courseLocations = courseObj.data.locations;
    courseLocations.forEach((location: any) => {
      locationsAsJSONStrings.push(JSON.stringify(location));
    });
  });
  const locationsAsObjs = removeDuplicatesFromArray(locationsAsJSONStrings).map((e: string) => JSON.parse(e));
  response.send(locationsAsObjs);
});
