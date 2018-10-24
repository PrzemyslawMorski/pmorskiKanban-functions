"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const buildGravatarURL_1 = require("./buildGravatarURL");
const admin = require("firebase-admin");
admin.initializeApp();
exports.getBoardMiniatures = functions.https.onCall((uid) => {
    return new Promise((resolve, reject) => {
        const boardsCollection = admin.firestore().collection("boards");
        const response = boardsCollection
            .where("ownerId", "==", uid)
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
        });
    });
});
exports.getGravatarUrl = functions.https.onCall((email) => {
    return buildGravatarURL_1.buildGravatarUrl(email);
});
//# sourceMappingURL=index.js.map