import { saveToFirestore } from '../util';
import Model from './Model';

type Tab = {
  name: string;
  url: string;
  subTabs?: Tab[];
};
export default class Course extends Model {
  collectionName: string;

  url: string;
  title: string;
  instructors: string[];
  description: string;
  imageURL: string;
  imageCaption: string;

  hasLectures: boolean;
  tabs: Tab[];

  semesterTaught: string;
  level: string;
  location: {
    topic: string;
    department: string;
    category: string;
  };
  sortAs: string;
  originalOCWData: any;

  constructor(data: any, id?: string) {
    super(id);
    this.collectionName = 'courses';

    this.instructors = data.instructors;
    this.description = data.description;
    this.imageURL = data.imageURL;
    this.imageCaption = data.imageCaption;
    this.hasLectures = data.hasLectures;
    this.tabs = data.tabs;

    this.url = data.url;
    this.semesterTaught = data.semesterTaught;
    this.originalOCWData = data.originalOCWData || {};
    this.level = data.level;
    this.location = data.location;
    this.title = data.title;
    this.sortAs = data.sortAs;
  }

  static getDataFromOCWJSON(json: any) {
    // get partial data from the OCW JSON -- additional data like instructors and tabs should be added manually
    return {
      url: json.href,
      semesterTaught: json.sem,
      level: json.level,
      location: {
        department: json.department,
        category: json.topics[0]?.subCat || 'N/A',
      },
      title: json.title,
      sortAs: json.sort_as,
      originalOCWData: json,
    };
  }

  toJSON() {
    // represents how this model is stored in Firestore
    return {
      url: this.url,
      title: this.title,
      semesterTaught: this.semesterTaught,
      level: this.level,
      sortAs: this.sortAs,
      location: this.location,
      originalOCWData: this.originalOCWData,

      instructors: this.instructors,
      description: this.description,
      imageURL: this.imageURL,
      imageCaption: this.imageCaption,
      hasLectures: this.hasLectures,
      tabs: this.tabs,
    };
  }

  save(): Promise<void> {
    return new Promise((resolve, reject) => {
      saveToFirestore(this.collectionName, this.id, this.toJSON()).then(() => {
        resolve();
      });
    });
  }
}
