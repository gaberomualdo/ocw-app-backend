import * as admin from 'firebase-admin';

import {
  GenericObject,
  saveToFirestore,
} from '../util';
import Model from './Model';

const firestore = admin.firestore();

type Tab = {
  name: string;
  url: string;
};

export default class Course extends Model {
  static collectionName: string = 'courses';
  data: {
    url: string;
    title: string;
    instructors: string[];
    description: string;
    imageURL: string;
    imageCaption: string;

    tabs: Tab[];
    hasLectures: boolean;

    semesterTaught: string;
    level: string;
    department: string;
    locations: {
      topic: string;
      category: string;
      speciality: string;
    }[];
    sortAs: string;
  };

  constructor(data: GenericObject, id?: string) {
    super(id);

    this.data = {
      instructors: data.instructors,
      description: data.description,
      imageURL: data.imageURL,
      imageCaption: data.imageCaption,
      hasLectures: data.hasLectures,
      tabs: data.tabs,
      url: data.url,
      semesterTaught: data.semesterTaught,
      level: data.level,
      department: data.department,
      locations: data.locations,
      title: data.title,
      sortAs: data.sortAs,
    };
  }

  async setIDToExistingCourseID(matchByKey: string = 'url') {
    const data: GenericObject = this.toJSON();
    const matchByValue: any = data[matchByKey];
    if (matchByValue) {
      const query = firestore.collection(Course.collectionName).where(matchByKey, '==', matchByValue);
      const snapshot = await query.get();
      snapshot.forEach((doc) => {
        this.id = doc.id;
      });
    } else {
      throw new Error(`Key '${matchByKey}' does not exist on this object.`);
    }
  }

  toJSON() {
    // represents how this model is stored in Firestore
    return this.data;
  }

  save(): Promise<void> {
    return new Promise((resolve, reject) => {
      saveToFirestore(Course.collectionName, this.id, this.toJSON())
        .catch((err) => reject(err))
        .then(() => resolve());
    });
  }
}
