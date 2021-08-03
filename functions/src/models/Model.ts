import {
  GenericObject,
  getNewID,
} from '../util';

export default abstract class Model {
  abstract toJSON(): GenericObject;
  static collectionName?: string;
  save?(): Promise<void>;
  id: string;

  constructor(id?: string) {
    this.id = id || getNewID();
  }
}
