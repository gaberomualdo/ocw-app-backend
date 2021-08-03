import { GenericObject } from '../util';
import Model from './Model';

export default class Lecture extends Model {
  data: {
    url: string;
    title: string;
    courseID: string;
    lectureIndex: number;
    aboutHTML: string;
    thumbnailURL: string;
    lectureNotesURL: string;
  };

  constructor(data: GenericObject, id?: string) {
    super(id);

    this.data = {
      url: data.url,
      title: data.title,
      courseID: data.courseID,
      lectureIndex: data.lectureIndex,
      aboutHTML: data.aboutHTML,
      thumbnailURL: data.thumbnailURL,
      lectureNotesURL: data.lectureNotesURL,
    };
  }

  toJSON() {
    return this.data;
  }
}
