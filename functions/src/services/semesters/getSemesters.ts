import * as functions from 'firebase-functions';

import { getAllFromFirestore } from '../../util';

export const getSemesters = functions.https.onRequest(async (request, response) => {
  const semesters = new Set();
  const courses = await getAllFromFirestore("courses");
  courses.forEach(course => {
    semesters.add(course.data().semesterTaught);
  });
  const semestersArray = Array.from(semesters);
  semestersArray.sort((a, b) => {
    const semesterTime = (x) => {
      let [season, year] = x.split(" ");
      year = parseInt(year);
      const seasons = ["Fall", "Spring", "Summer", "Winter"];
      return year * 10 + seasons.indexOf(season);
    }
    return semesterTime(b) - semesterTime(a);
  });
  
  response.send(semestersArray);
});