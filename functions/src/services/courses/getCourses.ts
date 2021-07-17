import * as functions from 'firebase-functions';

import { getAllFromFirestore } from '../../util';

/*

Search using:
  title
  instructors
  description
  image caption
  semester taught
  department
  locations

Find by:
  instructor
  location
  department
  level
  semester taught

Filter by:
  has video lectures
  user's favorites

Excluding search, sort by:
  Alphabetize by sortAs, then move those that are favorited to the start

*/
export const getCourses = functions.https.onRequest(async (request, response) => {
  const courses = await getAllFromFirestore('courses');
  const res = [];
  courses.forEach((course: any) => {
    res.push({ id: course.id, ...course.data() });
  });
});
