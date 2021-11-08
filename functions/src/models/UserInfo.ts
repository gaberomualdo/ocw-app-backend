import { GenericObject, saveToFirestore, toJSON } from "../util";
import Lecture from "./Lecture";
import Model from "./Model";

export default class UserInfo extends Model {
  static collectionName: string = "user-info";
  data: {
    favoritedCourseIDs: string[];
    lectureProgress: {
      [lectureURL: string]: {
        progressSeconds: number;
        lecture: Lecture["data"];
      };
    };
  };

  constructor(data: GenericObject, id?: string) {
    super(id);

    this.data = {
      favoritedCourseIDs: data.favoritedCourseIDs,
      lectureProgress: data.lectureProgress,
    };
  }

  toJSON() {
    return toJSON(this.data);
  }

  save(): Promise<void> {
    return new Promise((resolve, reject) => {
      saveToFirestore(UserInfo.collectionName, this.id, this.toJSON())
        .catch((err) => reject(err))
        .then(() => resolve());
    });
  }
}
