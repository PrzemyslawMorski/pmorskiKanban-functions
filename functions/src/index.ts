import * as functions from "firebase-functions";
import { buildGravatarUrl } from "./buildGravatarURL";
import * as admin from "firebase-admin";
import { IBoardMiniature } from "./dtos/IBoardMiniature";
admin.initializeApp();

export const getBoardMiniatures = functions.https.onCall((uid: string) => {
  return new Promise((resolve, reject) => {
    const boardsCollection = admin.firestore().collection("boards");
    const response = boardsCollection
      .where("ownerId", "==", uid)
      .get()
      .then((querySnapshot) => {
        const boardMiniatures = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          const boardMiniature: IBoardMiniature = {
            id: doc.id,
            name: docData.name,
            ownerId: docData.ownerId,
          };

          boardMiniatures.push(boardMiniature);
        })
        resolve(boardMiniatures);
      });
  });
});

export const getGravatarUrl = functions.https.onCall((email: string) => {
  return buildGravatarUrl(email);
});


