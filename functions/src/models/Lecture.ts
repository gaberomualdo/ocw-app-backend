import {
  GenericObject,
  toJSON,
} from '../util';
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
    videoURL: string;
  };

  constructor(data: GenericObject, id?: string) {
    super(id);

    this.data = {
      url: data.url,
      videoURL: data.videoURL,
      title: data.title,
      courseID: data.courseID,
      lectureIndex: data.lectureIndex,
      aboutHTML: data.aboutHTML,
      thumbnailURL: data.thumbnailURL,
      lectureNotesURL: data.lectureNotesURL,
    };
  }

  toJSON() {
    return toJSON(this.data);
  }
}
