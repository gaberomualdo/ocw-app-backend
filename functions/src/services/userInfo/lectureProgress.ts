import * as functions from 'firebase-functions';

import UserInfo from '../../models/UserInfo';
import { GenericObject } from '../../util';
import { validateReqAndGetUserInfo } from './common';

const express = require('express');
const app = express();
app.use(express.json());

const getLectureProgressInfo = async (request: any, response: any, callback: Function) => {
  if (request.method !== 'POST') {
    response.status(405);
    return;
  }

  let { lectureURL, lectureProgressObj } = request.body;
  if (!lectureURL || !lectureProgressObj) {
    response.status(404).json({
      message: 'lectureURL and/or lectureProgressObj not provided',
    });
    return;
  }
  callback(lectureURL, lectureProgressObj);
};

app.put('/setLectureProgress', (request: any, response: any) => {
  getLectureProgressInfo(request, response, (lectureURL: string, lectureProgressObj: GenericObject) => {
    validateReqAndGetUserInfo(request, response, async (userID: string, userInfoObj: UserInfo) => {
      userInfoObj.data.lectureProgress[lectureURL] = {
        progressSeconds: lectureProgressObj.progressSeconds,
        lecture: lectureProgressObj.lecture,
      };
      await userInfoObj.save();
      response.json(userInfoObj.toJSON());
    });
  });
});

// Expose Express API as a single Cloud Function:
export default functions.https.onRequest(app);
