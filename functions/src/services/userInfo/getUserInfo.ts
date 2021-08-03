import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import UserInfo from '../../models/UserInfo';

const firestore = admin.firestore();

export const getUserInfo = functions.https.onRequest(async (request, response) => {
  let { userID } = request.query;
  if (!userID) {
    response.status(404).json({
      message: 'userID not provided',
    });
    return;
  }
  userID = userID.toString();
  const query = firestore.collection(UserInfo.collectionName).doc(userID);
  const userInfo = await query.get();
  if (!userInfo.exists) {
    response.status(404).json({
      message: 'User info not found',
    });
    return;
  }

  const userInfoObj = new UserInfo(userInfo.data() || {}, userInfo.id);
  response.json(userInfoObj.toJSON());
});
