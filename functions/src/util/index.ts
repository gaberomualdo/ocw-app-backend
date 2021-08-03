import * as admin from 'firebase-admin';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import urljoin = require('url-join');

import Course from '../models/Course';
import { SITE_BASEURL } from './constants';

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
  const instructorsCoursesMap: { [key: string]: Course[] } = {};
  const courses = await getAllFromFirestore(Course.collectionName);
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

export function removeUselessWhitespace(str: string) {
  return str.replace(/\s\s+/g, ' ').trim();
}

export async function fetchJSON(url: string) {
  return await (await fetch(url)).json();
}

export async function fetchHTML(url: string) {
  const courseHTML = await (await fetch(url)).text();
  const courseDOM = new JSDOM(courseHTML);
  const document = courseDOM.window.document;
  return document;
}

export function isPathAbsolute(path: string) {
  const r = new RegExp('^(?:[a-z]+:)?//', 'i');
  return r.test(path);
}

export function parseURL(url: string) {
  if (isPathAbsolute(url)) return url;
  return urljoin(SITE_BASEURL, url);
}

export function getInnermostParent(element: Node) {
  let elm = element;
  while (elm.childNodes.length < 2) {
    elm = elm.childNodes[0];
  }
  return elm;
}

export type GenericObject = { [key: string]: any };
