import * as admin from 'firebase-admin';

import { validateUser } from '../../middleware';
import UserInfo from '../../models/UserInfo';
import { GenericObject } from '../../util';

const firestore = admin.firestore();

export const validateReqAndGetUserInfo = async (request: any, response: any, callback: Function) => {
  validateUser(request, response, async (user: GenericObject) => {
    const userID = user.uid;
    const query = firestore.collection(UserInfo.collectionName).doc(userID);
    const userInfo = await query.get();
    if (!userInfo.exists) {
      response.status(404).json({
        message: 'User info not found',
      });
      return;
    }

    const userInfoObj = new UserInfo(userInfo.data() || {}, userInfo.id);
    callback(userID, userInfoObj);
  });
};
