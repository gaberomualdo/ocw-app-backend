import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { INSTRUCTORS_COLLECTION_NAME } from "../../util/constants";

const firestore = admin.firestore();
export const getInstructor = functions.https.onRequest(
  async (request, response) => {
    let { name } = request.query;
    name = name?.toString();
    if (!name) {
      response.status(404).json({
        message: "Instructor not found or insufficient parameters provided",
      });
      return;
    }
    const instructorsRef = firestore.collection(INSTRUCTORS_COLLECTION_NAME);
    const results = await instructorsRef.where("name", "==", name).get();
    if (results.empty) {
      response.status(404).json({
        message: "Instructor not found or insufficient parameters provided",
      });
      return;
    }
    const resultData = results.docs[0].data();
    response.json(resultData);
  }
);
