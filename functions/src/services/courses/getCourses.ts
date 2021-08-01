import * as functions from 'firebase-functions';

import Course from '../../models/Course';
import {
  getAllFromFirestore,
  normalizeString,
} from '../../util';

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
  list of specified IDs

Excluding search, sort by:
  Alphabetize by sortAs

*/
export const getCourses = functions.https.onRequest(async (request, response) => {
  const coursesInDB = await getAllFromFirestore('courses');
  let courses: any[] = [];
  coursesInDB.forEach((course: any) => {
    const courseObj = new Course(course.data(), course.id);
    const courseData = courseObj.toJSON();
    courses.push(courseData);
  });

  // apply query params
  let { filterBy, findByKey, findByValue, searchQuery, matchesCourseIDs } = request.query;

  // filters
  switch (filterBy) {
    case 'hasVideoLectures':
      courses = courses.filter((e) => e.hasLectures);
      break;
    case 'noVideoLectures':
      courses = courses.filter((e) => !e.hasLectures);
      break;
  }

  // matches courses
  if (matchesCourseIDs) {
    const courseIDs = matchesCourseIDs.toString().split(',');
    courses = courses.filter((e) => courseIDs.includes(e.id));
  }

  // search
  if (searchQuery) {
    searchQuery = normalizeString(searchQuery.toString());
    courses = courses.filter((e) => {
      let locations: string[] = [];
      e.locations.forEach((loc: string) => {
        locations = [...locations, ...Object.values(loc)];
      });
      for (let text of [e.title, e.description, e.imageCaption, e.semesterTaught, e.department, ...locations, ...e.instructors]) {
        text = normalizeString(text);
        if (text.includes(searchQuery)) return true;
      }
      return false;
    });
  }

  // find by
  if (findByKey && findByValue) {
    findByValue = findByValue.toString();
    switch (findByKey) {
      case 'instructor':
        courses = courses.filter((e) => e.instructors.includes(findByValue));
        break;
      case 'level':
        courses = courses.filter((e) => e.level === findByValue);
        break;
      case 'department':
        courses = courses.filter((e) => e.department === findByValue);
        break;
      case 'semesterTaught':
        courses = courses.filter((e) => e.semesterTaught === findByValue);
        break;
      case 'location':
        const [topic, category, specialty] = findByValue.split(',');
        courses = courses.filter((e) => {
          for (let location of e.locations) {
            if (location.topic === topic) return true;
            if (location.category === category) return true;
            if (location.specialty === specialty) return true;
          }
          return false;
        });
        break;
    }
  }

  // alphabetize results for non-search
  if (!searchQuery) courses.sort((a, b) => a.sortAs.localeCompare(b.sortAs));

  // return
  response.json(courses);
});
