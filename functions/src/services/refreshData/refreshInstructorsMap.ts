import * as functions from 'firebase-functions';

import Course from '../../models/Course';
import {
  getInstructorsCoursesMap,
  removeDuplicatesFromArray,
} from '../../util';

export const getInstructors = functions.https.onRequest(async (request, response) => {
  const instructorsCoursesMap: { [key: string]: Course[] } = await getInstructorsCoursesMap();
  response.json(
    Object.keys(instructorsCoursesMap).map((instructorName) => {
      const instructorCourses: Course[] = instructorsCoursesMap[instructorName];
      return {
        name: instructorName,
        departments: removeDuplicatesFromArray(instructorCourses.map((course: Course) => course.data.department)),
        numberOfCourses: instructorCourses.length,
      };
    })
  );
});
