import * as functions from 'firebase-functions';

import Course from '../../models/Course';
import {
  Cache,
  getInstructorsCoursesMap,
  removeDuplicatesFromArray,
} from '../../util';

const refreshInstructorsMap = functions.https.onRequest(async (request, response) => {
  const instructorsCoursesMap: { [key: string]: Course[] } = await getInstructorsCoursesMap();
  const data = Object.keys(instructorsCoursesMap).map((instructorName) => {
    const instructorCourses: Course[] = instructorsCoursesMap[instructorName];
    return {
      name: instructorName,
      departments: removeDuplicatesFromArray(instructorCourses.map((course: Course) => course.data.department)),
      numberOfCourses: instructorCourses.length,
    };
  });
  await Cache.saveToCache('instructors-map', data);
});
export default refreshInstructorsMap;
