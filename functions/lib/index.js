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
        const boardRef = admin.firestore()
            .collection("boards")
            .doc(boardId);
        boardRef.get()
            .then((doc) => {
            if (doc.exists) {
                const docData = doc.data();
                if (docData.ownerId !== userId) {
                    reject("Board can't be accessed.");
                    return;
                }
                const board = {
                    id: doc.id,
                    name: docData.name,
                    ownerId: docData.ownerId,
                    lists: []
                };
                boardRef.getCollections()
                    .then((boardRefCollections) => {
                    const lists = boardRefCollections.find(collection => collection.id === "lists");
                    if (lists !== undefined) {
                        lists.get()
                            .then(listsDocs => {
                            listsDocs.forEach((listDoc) => {
                                const listData = listDoc.data();
                                const list = {
                                    id: listDoc.id,
                                    name: listData.name,
                                    boardId: listData.boardId,
                                    nextListId: listData.nextListId,
                                    prevListId: listData.prevListId,
                                    tasks: []
                                };
                                listDoc.ref.getCollections()
                                    .then((listCollections) => {
                                    const tasks = listCollections.find(collection => collection.id === "tasks");
                                    if (tasks !== undefined) {
                                        tasks.get()
                                            .then((tasksDocs) => {
                                            tasksDocs.forEach((taskDoc) => {
                                                const taskData = taskDoc.data();
                                                const task = {
                                                    id: taskDoc.id,
                                                    name: taskData.name,
                                                    description: taskData.description,
                                                    listId: list.id,
                                                    nextTask: taskData.nextTaskId,
                                                    prevTask: taskData.prevTaskId
                                                };
                                                list.tasks.push(task);
                                                console.log("Pushed task " + task.id + " to list " + list.id);
                                            });
                                            resolve(board);
                                        });
                                    }
                                });
                                board.lists.push(list);
                                console.log("Pushed list " + list.id + " to board " + board.id);
                            });
                        });
                    }
                });
                resolve(board);
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