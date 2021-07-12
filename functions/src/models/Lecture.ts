import { saveToFirestore } from '../util';
import Model from './Model';

export default class Lecture extends Model {
  collectionName: string;

  url: string;
  title: string;
  courseID: string;
  lectureNumber: number;
  description: string;
  instructors: string[];
  thumbnailURL: string;
  lectureNotesHTML: string;

  constructor(data: any, id?: string) {
    super(id);
    this.collectionName = 'lectures';

    this.url = data.url;
    this.title = data.title;
    this.courseID = data.courseID;
    this.lectureNumber = data.lectureNumber;
    this.description = data.description;
    this.instructors = data.instructors;
    this.thumbnailURL = data.thumbnailURL;
    this.lectureNotesHTML = data.lectureNotesHTML;
  }

  toJSON() {
    return {
      url: this.url,
      title: this.title,
      courseID: this.courseID,
      lectureNumber: this.lectureNumber,
      description: this.description,
      instructors: this.instructors,
      thumbnailURL: this.thumbnailURL,
      lectureNotesHTML: this.lectureNotesHTML,
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
