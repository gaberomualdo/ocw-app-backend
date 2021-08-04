import * as functions from 'firebase-functions';

import UserInfo from '../../models/UserInfo';
import { validateReqAndGetUserInfo } from './common';

export const getUserInfo = functions.https.onRequest(async (request, response) => {
  validateReqAndGetUserInfo(request, response, async (userID: string, userInfoObj: UserInfo) => {
    response.json(userInfoObj.toJSON());
  });
});
