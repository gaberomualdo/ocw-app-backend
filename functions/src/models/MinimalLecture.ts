import { GenericObject, toJSON } from "../util";
import Model from "./Model";

export default class MinimalLecture extends Model {
  data: {
    url: string;
    title: string;
    courseID: string;
    lectureIndex: number;
    thumbnailURL: string;
  };

  constructor(data: GenericObject, id?: string) {
    super(id);

    this.data = {
      url: data.url,
      title: data.title,
      courseID: data.courseID,
      lectureIndex: data.lectureIndex,
      thumbnailURL: data.thumbnailURL,
    };
  }

  toJSON() {
    return toJSON(this.data);
  }
}
