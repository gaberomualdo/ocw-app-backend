import * as admin from 'firebase-admin';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import urljoin = require('url-join');

import Course from '../models/Course';
import { SITE_BASEURL } from './constants';

const matchAll = require('string.prototype.matchall');
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
  const HTML = await (await fetch(url)).text();
  const DOM = new JSDOM(HTML);
  const document = DOM.window.document;
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

export function getHostname(url: string) {
  const { hostname } = new URL(url);
  return hostname;
}

export function isLocalURL(url: string): boolean {
  const hostname = getHostname(url);
  const ourHostname = getHostname(SITE_BASEURL);
  return hostname === ourHostname || hostname === `www.${ourHostname}` || `www.${hostname}` === ourHostname;
}

export function getInnermostParent(element: any) {
  let elm = element;
  while (elm.childNodes.length < 2) {
    elm = elm.childNodes[0];
  }
  return elm;
}

export function findURLsInText(text: string) {
  const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)/gm;
  return [...matchAll(text, regex)].map((e: string[]) => e[0]);
}

export function toJSON(obj: any) {
  // TODO: figure out a better way of doing this
  return JSON.parse(JSON.stringify(obj));
}

export type GenericObject = { [key: string]: any };

export class TimeLog {
  start: Date;
  constructor(start?: Date) {
    if (start) {
      this.start = start;
    } else {
      this.start = new Date();
    }
  }
  getTime() {
    const res = new Date().getTime() - this.start.getTime();
    this.start = new Date();
    return res;
  }
}

// https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt: string) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export function parseKebabCase(text: string) {
  return text.replace(/-/g, ' ');
}
