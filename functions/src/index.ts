import * as functions from "firebase-functions";
import {buildGravatarUrl} from "./buildGravatarURL";
import * as admin from "firebase-admin";

export const getBoardMiniatures = functions.https.onCall((uid: string) => {
  console.log('getBoardsMiniatures');
  const boardsCollection = admin.firestore().collection("boards");
  const field: string | FirebaseFirestore.FieldPath = "ownerId";
  const operator: FirebaseFirestore.WhereFilterOp = "==";
  const response = boardsCollection.where(field, operator, uid);
  console.log('getBoardsMiniatures' + response.toString());
  return response;
});

export const getGravatarUrl = functions.https.onCall((email: string) => {
  return buildGravatarUrl(email);
});


