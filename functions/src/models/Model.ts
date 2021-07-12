import { getNewID } from '../util';

export default abstract class Model {
  abstract toJSON(): any;
  abstract save(): Promise<void>;
  abstract collectionName: string;
  id: string;

  constructor(id?: string) {
    this.id = id || getNewID();
  }
}
