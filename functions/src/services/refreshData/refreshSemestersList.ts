import * as functions from 'firebase-functions';

import Course from '../../models/Course';
import { getAllFromFirestore } from '../../util';

export const getSemesters = functions.https.onRequest(async (request, response) => {
  const semesters: Set<string> = new Set();
  const courses = await getAllFromFirestore(Course.collectionName);
  courses.forEach((course) => {
    const courseObj = new Course(course.data(), course.id);
    semesters.add(courseObj.data.semesterTaught);
  });
  const semestersArray = Array.from(semesters);
  semestersArray.sort((a: string, b: string) => {
    const semesterTime = (x: string) => {
      let [season, year] = x.split(' ');
      const yearNum = parseInt(year);
      const seasons = ['Fall', 'Spring', 'Summer', 'Winter'];
      return yearNum * 10 + seasons.indexOf(season);
    };
    return semesterTime(b) - semesterTime(a);
  });

  response.json(semestersArray);
});