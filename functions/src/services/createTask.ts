import { getBoardSnap, getListSnap } from "./dbUtils";
import { ITask } from "../dtos/ITask";
import * as admin from "firebase-admin";

export const createTaskService = (boardId: string, listId: string, taskName: string, ownerId: string) => {
    return new Promise((resolve, reject) => {
        getBoardSnap(boardId, ownerId).then((boardSnap) => {
            getListSnap(boardSnap, listId).then((listSnap) => {
                if (taskName === "") {
                    reject("No task name supplied");
                    return;
                }

                listSnap.ref.collection("tasks").where("nextTaskId", "==", "").get().then((lastTaskQuerySnap) => {
                    console.log('got tasks collection')
                    if (lastTaskQuerySnap.size > 1) {
                        reject("Error creating task. Please contact our support staff.");
                        console.error("More than one task with nextTaskId == '' in board " + boardId + " list " + listId);
                        return;
                    }

                    const newTaskRef = listSnap.ref.collection("tasks").doc();

                    if (lastTaskQuerySnap.empty) {
                        const newTaskData = {
                            name: taskName,
                            description: "",
                            listId: listId,
                            nextTaskId: "",
                            prevTaskId: "",
                        }

                        newTaskRef.set(newTaskData).then(() => {
                            const createdTask: ITask = {
                                ...newTaskData, id: newTaskRef.id
                            }
                            resolve({ boardId: boardId, listId: listId, task: createdTask });
                        }).catch((err) => {
                            reject("Error creating task. Please contact our support staff.");
                            console.error(err);
                            return;
                        });;
                    } else {
                        const lastTask = lastTaskQuerySnap.docs[0].ref;
                        const newTaskData = {
                            name: taskName,
                            description: "",
                            listId: listId,
                            nextTaskId: "",
                            prevTaskId: lastTask.id,
                        }

                        const batch = admin.firestore().batch();
                        batch.update(lastTask, { nextTaskId: newTaskRef.id });
                        batch.set(newTaskRef, newTaskData);

                        batch.commit().then(() => {
                            const createdTask: ITask = {
                                ...newTaskData, id: newTaskRef.id
                            }
                            resolve({ boardId: boardId, listId: listId, task: createdTask });
                            return;
                        }).catch((err) => {
                            reject("Error creating task. Please contact our support staff.");
                            console.error(err);
                            return;
                        });
                    }
                }).catch((err) => {
                    reject("Error creating task. Please contact our support staff.");
                    console.error(err);
                    return;
                });
            }).catch((err) => {
                reject(err);
                console.log(err);
                return;
            });
        }).catch((err) => {
            reject(err);
            console.log(err);
            return;
        });
    });
};
