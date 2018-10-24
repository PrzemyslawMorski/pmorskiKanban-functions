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

          const allPromises = [];

          const getListsPromise = boardRef.getCollections();
          allPromises.push(getListsPromise);

          getListsPromise.then((boardRefCollections) => {
            const listsCollection = boardRefCollections.find(collection => collection.id === "lists");

            const lists = [];

            if (listsCollection !== undefined) {
              const getListsCollectionPromise = listsCollection.get();
              allPromises.push(getListsCollectionPromise);

              getListsCollectionPromise
                .then(listsDocs => {
                  listsDocs.forEach((listDoc) => {
                    const listData = listDoc.data();
                    const listRef = listDoc.ref;

                    const getTasksCollectionPromise = listRef.getCollections();
                    allPromises.push(getTasksCollectionPromise);

                    getTasksCollectionPromise
                      .then((listCollections) => {
                        const tasksCollection = listCollections.find(collection => collection.id === "tasks");
                        const tasks = [];

                        if (tasksCollection !== undefined) {
                          const getTasksPromise = tasksCollection.get();
                          allPromises.push(getTasksPromise);

                          getTasksPromise
                            .then((tasksDocs) => {
                              tasksDocs.forEach((taskDoc) => {
                                const taskData = taskDoc.data();

                                const task: ITask = {
                                  id: taskDoc.id,
                                  name: taskData.name,
                                  description: taskData.description,
                                  listId: listRef.id,
                                  nextTask: taskData.nextTaskId,
                                  prevTask: taskData.prevTaskId
                                };

                                tasks.push(task);
                                console.log("Pushed task " + task.id + " to list " + listRef.id)
                              });
                            });
                        }

                        const list: IList = {
                          id: listDoc.id,
                          name: listData.name,
                          boardId: boardRef.id,
                          nextListId: listData.nextListId,
                          prevListId: listData.prevListId,
                          tasks: tasks
                        };

                        lists.push(list);
                        console.log("Pushed list " + list.id + " to board " + board.id)
                      });
                  });
                });
            }

            Promise.all(allPromises)
              .then(() => {
                resolve(board)
              });
          });
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


