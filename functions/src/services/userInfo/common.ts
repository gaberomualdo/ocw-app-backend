import * as admin from "firebase-admin";

import { validateUser } from "../../middleware";
import UserInfo from "../../models/UserInfo";
import { GenericObject } from "../../util";

const firestore = admin.firestore();

const defaultUserInfoData: UserInfo["data"] = {
  favoritedCourseIDs: [],
  lectureProgress: {},
};

export const validateReqAndGetUserInfo = async (
  request: any,
  response: any,
  callback: Function
) => {
  validateUser(request, response, async (user: GenericObject) => {
    const userID = user.uid;
    let userInfoObj: UserInfo;
    const query = firestore.collection(UserInfo.collectionName).doc(userID);
    const userInfo = await query.get();
    if (userInfo.exists) {
      userInfoObj = new UserInfo(
        userInfo.data() || defaultUserInfoData,
        userInfo.id
      );
    } else {
      userInfoObj = new UserInfo(defaultUserInfoData, userID);
      await userInfoObj.save();
    }
    callback(userID, userInfoObj);
  });
};
