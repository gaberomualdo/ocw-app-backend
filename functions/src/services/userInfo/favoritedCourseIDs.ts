import * as functions from 'firebase-functions';

import UserInfo from '../../models/UserInfo';
import { validateReqAndGetUserInfo } from './common';

const getCourseID = async (request: any, response: any, callback: Function) => {
  let { courseID } = request.query;
  if (!courseID) {
    response.status(404).json({
      message: 'courseID not provided',
    });
    return;
  }
  courseID = courseID.toString();
  callback(courseID);
};

export const addFavoritedCourseID = functions.https.onRequest(async (request, response) => {
  getCourseID(request, response, (courseID: string) => {
    validateReqAndGetUserInfo(request, response, async (userID: string, userInfoObj: UserInfo) => {
      if (!userInfoObj.data.favoritedCourseIDs.includes(courseID)) {
        userInfoObj.data.favoritedCourseIDs.push(courseID);
        await userInfoObj.save();
      }
      response.json(userInfoObj.toJSON());
    });
  });
});
export const removeFavoritedCourseID = functions.https.onRequest(async (request, response) => {
  getCourseID(request, response, (courseID: string) => {
    validateReqAndGetUserInfo(request, response, async (userID: string, userInfoObj: UserInfo) => {
      if (userInfoObj.data.favoritedCourseIDs.includes(courseID)) {
        const index = userInfoObj.data.favoritedCourseIDs.indexOf(courseID);
        userInfoObj.data.favoritedCourseIDs.splice(index, 1);
        await userInfoObj.save();
      }
      response.json(userInfoObj.toJSON());
    });
  });
});
