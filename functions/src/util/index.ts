import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

import Course from '../models/Course';

const uuid = require('uuid');
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
    const courseObj = new Course(course.data(), course.id);
    const courseData = courseObj.data;
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

export async function fetchJSON(url: string) {
  return await (await fetch(url)).json();
}

export type GenericObject = { [key: string]: any };
