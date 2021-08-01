import * as admin from 'firebase-admin';

import Course from '../models/Course';

const uuid = require('uuid');

admin.initializeApp();
const firestore = admin.firestore();

export function getNewID(): string {
  return uuid.v4();
}

export async function saveToFirestore(collection: string, id: string, data: any) {
  return await firestore.collection(collection).doc(id).set(data);
}

export async function getAllFromFirestore(collection: string) {
  return await firestore.collection(collection).get();
}

export async function getInstructorsCoursesMap(): Promise<{ [key: string]: Course[] }> {
  const instructorsCoursesMap: any = {};
  const courses = await getAllFromFirestore('courses');
  courses.forEach((course) => {
    const courseData = course.data();
    courseData.instructors.forEach((instructorName: any) => {
      if (!instructorsCoursesMap[instructorName]) instructorsCoursesMap[instructorName] = [];
      const courseObj = new Course(courseData, course.id);
      instructorsCoursesMap[instructorName].push(courseObj);
    });
  });
  return instructorsCoursesMap;
}

export function removeDuplicatesFromArray(array: any[]) {
  return array.filter((item, index, self) => self.indexOf(item) === index);
}

export function cleanString(str: string) {
  const newStr = str;
  newStr.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return newStr;
}

export function normalizeString(str: string) {
  return cleanString(str).toLowerCase();
}
