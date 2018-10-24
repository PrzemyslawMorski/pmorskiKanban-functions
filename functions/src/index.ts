import * as functions from "firebase-functions";
import { buildGravatarUrl } from "./buildGravatarURL";
import * as admin from "firebase-admin";
import { IBoardMiniature } from "./dtos/IBoardMiniature";
import { IBoard } from "./dtos/IBoard";
import { IList } from "./dtos/IList";
import { ITask } from "./dtos/ITask";
admin.initializeApp();

export const getBoardMiniatures = functions.https.onCall(({ userId }: { userId: string }) => {
  return new Promise((resolve, reject) => {
    const boardsCollection = admin.firestore().collection("boards");
    boardsCollection
      .where("ownerId", "==", userId)
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
        return;
      });
  });
});

export const getBoard = functions.https.onCall(({ boardId, userId }: { boardId: string, userId: string }) => {
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

          const board: IBoard = {
            id: doc.id,
            name: docData.name,
            ownerId: docData.ownerId,
            lists: []
          }

          boardRef.getCollections()
            .then((boardRefCollections) => {
              const lists = boardRefCollections.find(collection => collection.id === "lists");

              if (lists !== undefined) {
                lists.get()
                  .then(listsDocs => {
                    listsDocs.forEach((listDoc) => {
                      const listData = listDoc.data();

                      const list: IList = {
                        id: listDoc.id,
                        name: listData.name,
                        boardId: listData.boardId,
                        nextList: listData.nextListId,
                        prevList: listData.prevListId,
                        tasks: []
                      }

                      listDoc.ref.getCollections()
                        .then((listCollections) => {
                          const tasks = listCollections.find(collection => collection.id === "tasks");

                          if (tasks !== undefined) {
                            tasks.get()
                              .then((tasksDocs) => {
                                tasksDocs.forEach((taskDoc) => {
                                  const taskData = taskDoc.data();

                                  const task: ITask = {
                                    id: taskDoc.id,
                                    name: taskData.name,
                                    description: taskData.description,
                                    nextTask: taskData.nextTaskId,
                                    prevTask: taskData.prevTaskId
                                  }

                                  list.tasks.push(task);
                                })
                              })
                          }
                        })

                      board.lists.push(list);
                    });
                  })
              }
            });

          resolve(board);
        } else {
          reject("Board doesn't exist.")
          return;
        }
      })
      .catch((error) => {
        console.log("Error getting board: ", error);
        reject(error)
        return;
      });
  });
});

export const getGravatarUrl = functions.https.onCall((email: string) => {
  return buildGravatarUrl(email);
});


