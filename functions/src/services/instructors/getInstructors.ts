import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { INSTRUCTORS_COLLECTION_NAME } from "../../util/constants";

const firestore = admin.firestore();
export const getInstructors = functions.https.onRequest(
  async (request, response) => {
    const res = await (
      await firestore.collection(INSTRUCTORS_COLLECTION_NAME).select()
    )
      .orderBy("numberOfCourses", "desc")
      .get();
    response.json(res.docs.map((e) => e.id));
  }
);
