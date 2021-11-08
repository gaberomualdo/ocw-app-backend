import * as admin from "firebase-admin";

import { saveToFirestore, toJSON } from "../util";
import { CACHE_COLLECTION_NAME } from "./constants";

const firestore = admin.firestore();

export type CacheItemName =
  | "instructors-names"
  | "locations"
  | "semesters-list";

export default class Cache {
  static async fetchFromCache(itemName: CacheItemName): Promise<any> {
    const itemRef = firestore.collection(CACHE_COLLECTION_NAME).doc(itemName);
    const doc = await itemRef.get();
    if (!doc.exists) {
      throw new Error(
        `Cache with specified item name '${itemName}' not found.`
      );
    }
    return doc.data()?.data;
  }
  static saveToCache(itemName: CacheItemName, data: any): Promise<void> {
    data = toJSON(data);
    return new Promise((resolve, reject) => {
      saveToFirestore(CACHE_COLLECTION_NAME, itemName, { data })
        .catch((err) => reject(err))
        .then(() => resolve());
    });
  }
}
