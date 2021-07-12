import * as admin from 'firebase-admin';

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

export async function getInstructorsCoursesMap() {
  const instructorsCoursesMap: any = {};
  const courses = await getAllFromFirestore('courses');
  courses.forEach((course) => {
    const courseData = course.data();
    courseData.instructors.forEach((instructorName: any) => {
      if (!instructorsCoursesMap[instructorName]) instructorsCoursesMap[instructorName] = [];
      instructorsCoursesMap[instructorName].push(courseData);
    });
  });
  return instructorsCoursesMap;
}

export function removeDuplicatesFromArray(array: any[]) {
  return array.filter((item, index, self) => self.indexOf(item) === index);
}
