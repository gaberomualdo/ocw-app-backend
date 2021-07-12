import * as functions from 'firebase-functions';

import {
  getInstructorsCoursesMap,
  removeDuplicatesFromArray,
} from '../../util';

export const getInstructors = functions.https.onRequest(async (request, response) => {
  const instructorsCoursesMap = await getInstructorsCoursesMap();
  response.send(
    Object.keys(instructorsCoursesMap).map((instructorName) => {
      const instructorCourses = instructorsCoursesMap[instructorName];
      return {
        name: instructorName,
        departments: removeDuplicatesFromArray(instructorCourses.map((course: any) => course.location.department)),
        numberOfCourses: instructorCourses.length,
      };
    })
  );
});
