import * as admin from "firebase-admin";

// Most of this code is from https://github.com/firebase/functions-samples/blob/main/authorized-https-endpoint/functions/index.js
// which is licensed under the Apache License 2.0 by Google Inc. in 2016.
export const validateUser = async (req: any, res: any, callback: any) => {
  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")) &&
    !(req.cookies && req.cookies.__session)
  ) {
    res.status(403).json({ message: "Invalid authorization" });
    return;
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else if (req.cookies) {
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).json({ message: "Invalid authorization" });
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    callback(decodedIdToken);
    return;
  } catch (error) {
    res.status(403).json({ message: "Invalid authorization" });
    return;
  }
};
