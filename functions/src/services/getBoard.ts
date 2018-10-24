import * as admin from "firebase-admin";
import { IBoard } from "../dtos/IBoard";
import { ITask } from "../dtos/ITask";
import { IList } from "../dtos/IList";

export const getBoardService = (boardId: string, userId: string) => {
    return new Promise((resolve, reject) => {
        if (boardId === "" || userId === "") {
            reject("Board id or user id is empty.");
            return;
        }

        const boardDocRef = admin.firestore()
            .collection("boards")
            .doc(boardId);

        boardDocRef.get()
            .then((boardDoc) => {
                if (boardDoc.exists) {
                    const boardData = boardDoc.data();
                    if (boardData.ownerId !== userId) {
                        reject("Board can't be accessed.");
                        return;
                    }

                    boardDocRef.getCollections().then((boardCollections) => {
                        const listsCollection = boardCollections.find(collection => collection.id === "lists");

                        if (listsCollection !== undefined) {
                            listsCollection.get()
                                .then(listsDocs => {
                                    const getListsCollectionsPromises = [];
                                    const lists: Array<IList> = [];

                                    listsDocs.forEach((listSnapshot) => {
                                        const getListCollectionsPromise = listSnapshot.ref.getCollections();
                                        const listData = listSnapshot.data();

                                        const list: IList = {
                                            id: listSnapshot.id,
                                            name: listData.name,
                                            boardId: boardDoc.id,
                                            nextListId: listData.nextListId,
                                            prevListId: listData.prevListId,
                                            tasks: []
                                        }

                                        getListsCollectionsPromises.push(getListCollectionsPromise);
                                        lists.push(list);
                                    });

                                    Promise.all(getListsCollectionsPromises)
                                        .then((listsCollections) => {
                                            const getListsTasksPromises = [];

                                            listsCollections.forEach((listCollections) => {
                                                const tasksCollection = listCollections.find(collection => collection.id === "tasks");

                                                if (tasksCollection !== undefined) {
                                                    const getTasksPromise = tasksCollection.get();
                                                    getListsTasksPromises.push(getTasksPromise);
                                                }
                                            });

                                            Promise.all(getListsTasksPromises)
                                                .then((listsTasksSnaps) => {
                                                    listsTasksSnaps.forEach((listTasksSnap) => {
                                                        listTasksSnap.forEach((listTaskSnap) => {
                                                            const taskData = listTaskSnap.data();

                                                            const task: ITask = {
                                                                id: listTaskSnap.id,
                                                                name: taskData.name,
                                                                description: taskData.description,
                                                                listId: taskData.listId,
                                                                nextTaskId: taskData.nextTaskId,
                                                                prevTaskId: taskData.prevTaskId
                                                            };

                                                            const list = lists.find((someList) => someList.id === task.listId);
                                                            list.tasks.push(task);
                                                        })

                                                    });

                                                    const board: IBoard = {
                                                        id: boardDoc.id,
                                                        name: boardData.name,
                                                        ownerId: boardData.ownerId,
                                                        lists: lists
                                                    }
                                                    resolve(board);
                                                })
                                                .catch((error) => {
                                                    console.log(error);
                                                    const board: IBoard = {
                                                        id: boardDoc.id,
                                                        name: boardData.name,
                                                        ownerId: boardData.ownerId,
                                                        lists: []
                                                    }
                                                    resolve(board);
                                                });
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            const board: IBoard = {
                                                id: boardDoc.id,
                                                name: boardData.name,
                                                ownerId: boardData.ownerId,
                                                lists: []
                                            }
                                            resolve(board);
                                        });
                                });
                        } else {
                            const board: IBoard = {
                                id: boardDoc.id,
                                name: boardData.name,
                                ownerId: boardData.ownerId,
                                lists: []
                            }
                            resolve(board);
                        }
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
}
