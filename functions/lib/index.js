"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const buildGravatarURL_1 = require("./buildGravatarURL");
const admin = require("firebase-admin");
admin.initializeApp();
exports.getBoardMiniatures = functions.https.onCall(({ userId }) => {
    return new Promise((resolve, reject) => {
        const boardsCollection = admin.firestore().collection("boards");
        boardsCollection
            .where("ownerId", "==", userId)
            .get()
            .then((querySnapshot) => {
            const boardMiniatures = [];
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                const boardMiniature = {
                    id: doc.id,
                    name: docData.name,
                    ownerId: docData.ownerId,
                };
                boardMiniatures.push(boardMiniature);
            });
            resolve(boardMiniatures);
            return;
        });
    });
});
exports.getBoard = functions.https.onCall(({ boardId, userId }) => {
    return new Promise((resolve, reject) => {
        if (boardId === "" || userId === "") {
            reject("Board id or user id is empty.");
            return;
        }
        admin.firestore()
            .collection("boards")
            .doc(boardId).get()
            .then((doc) => {
            if (doc.exists) {
                const docData = doc.data();
                if (docData.ownerId !== userId) {
                    reject("Board can't be accessed.");
                    return;
                }
                // TODO if not an owner or member reject access
                resolve(doc.data());
                return;
            }
            else {
                reject("Board doesn't exist.");
                return;
            }
        })
            .catch((error) => {
            console.log("Error getting board: ", error);
            reject(error);
            return;
        });
    });
});
exports.getGravatarUrl = functions.https.onCall((email) => {
    return buildGravatarURL_1.buildGravatarUrl(email);
});
//# sourceMappingURL=index.js.map