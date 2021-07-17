import { saveToFirestore } from '../util';
import Model from './Model';

export default class Lecture extends Model {
  collectionName: string;

  data: {
    url: string;
    title: string;
    courseID: string;
    lectureNumber: number;
    description: string;
    instructors: string[];
    thumbnailURL: string;
    lectureNotesHTML: string;
  };

  constructor(data: any, id?: string) {
    super(id);
    this.collectionName = 'lectures';

    this.data = {
      url: data.url,
      title: data.title,
      courseID: data.courseID,
      lectureNumber: data.lectureNumber,
      description: data.description,
      instructors: data.instructors,
      thumbnailURL: data.thumbnailURL,
      lectureNotesHTML: data.lectureNotesHTML,
    };
  }

  toJSON() {
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
