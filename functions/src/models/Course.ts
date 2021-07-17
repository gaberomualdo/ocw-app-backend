import { saveToFirestore } from '../util';
import Model from './Model';

type Tab = {
  name: string;
  url: string;
  subTabs?: Tab[];
};

export default class Course extends Model {
  collectionName: string;
  data: {
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
    department: string;
    locations: {
      topic: string;
      category: string;
      specialty: string;
    }[];
    sortAs: string;
    originalOCWData: any;
  };

  constructor(data: any, id?: string) {
    super(id);
    this.collectionName = 'courses';

    this.data = {
      instructors: data.instructors,
      description: data.description,
      imageURL: data.imageURL,
      imageCaption: data.imageCaption,
      hasLectures: data.hasLectures,
      tabs: data.tabs,
      url: data.url,
      semesterTaught: data.semesterTaught,
      originalOCWData: data.originalOCWData || {},
      level: data.level,
      department: data.department,
      locations: data.locations,
      title: data.title,
      sortAs: data.sortAs,
    };
  }

  toJSON() {
    // represents how this model is stored in Firestore
    return this.data;
  }

  save(): Promise<void> {
    return new Promise((resolve, reject) => {
      saveToFirestore(this.collectionName, this.id, this.toJSON())
        .catch((err) => reject(err))
        .then(() => resolve());
    });
  }
}
