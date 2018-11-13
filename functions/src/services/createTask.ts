import {getBoardSnap, getListSnap, isOwner} from "./dbUtils";
import {ITask} from "../dtos/ITask";
import * as admin from "firebase-admin";
import {ICreateTaskResponse} from "../dtos/responses";

export const createTaskService = (boardId: string, listId: string, taskName: string, userId: string): Promise<ICreateTaskResponse> => {
    return new Promise((resolve, reject) => {
        if (boardId === "" || boardId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Board's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (listId === "" || listId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "List's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (taskName === "" || taskName === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Task's name was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (userId === "" || userId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "User's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        getBoardSnap(boardId, userId).then((boardSnap) => {
            if (!isOwner(boardSnap, userId)) {
                const rejectResponse = {
                    status: 'permission-denied',
                    message: "You can't create tasks in a board you do not own.",
                };
                reject(rejectResponse);
                return;
            }

            getListSnap(boardSnap, listId).then((listSnap) => {
                listSnap.ref.collection("tasks").where("nextTaskId", "==", "").get().then((lastTaskQuerySnap) => {
                    if (lastTaskQuerySnap.size > 1) {
                        console.error("More than one task with nextTaskId == '' in board " + boardId + " list " + listId);
                        const rejectResponse = {
                            status: 'internal',
                            message: "Task was not created. There is a problem with the database. Please try again later.",
                        };
                        reject(rejectResponse);
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
                        };

                        newTaskRef.set(newTaskData).then(() => {
                            const createdTask: ITask = {
                                ...newTaskData, id: newTaskRef.id, attachments: [],
                            };

                            const response: ICreateTaskResponse = {
                                boardId: boardId,
                                listId: listId,
                                task: createdTask,
                            };

                            resolve(response);
                        }).catch((err) => {
                            console.error(err);
                            const rejectResponse = {
                                status: 'internal',
                                message: "Task was not created. There is a problem with the database. Please try again later.",
                            };
                            reject(rejectResponse);
                            return;
                        });
                    } else {
                        const lastTask = lastTaskQuerySnap.docs[0].ref;
                        const newTaskData = {
                            name: taskName,
                            description: "",
                            listId: listId,
                            nextTaskId: "",
                            prevTaskId: lastTask.id,
                        };

                        const batch = admin.firestore().batch();
                        batch.update(lastTask, {nextTaskId: newTaskRef.id});
                        batch.set(newTaskRef, newTaskData);

                        batch.commit().then(() => {
                            const createdTask: ITask = {
                                ...newTaskData, id: newTaskRef.id, attachments: [],
                            };

                            const response: ICreateTaskResponse = {
                                boardId: boardId,
                                listId: listId,
                                task: createdTask,
                            };

                            resolve(response);
                        }).catch((err) => {
                            console.error(err);
                            const rejectResponse = {
                                status: 'internal',
                                message: "Task was not created. There is a problem with the database. Please try again later.",
                            };
                            reject(rejectResponse);
                            return;
                        });
                    }
                }).catch((err) => {
                    console.error(err);
                    const rejectResponse = {
                        status: 'internal',
                        message: "Task was not created. There is a problem with the database. Please try again later.",
                    };
                    reject(rejectResponse);
                    return;
                });
            }).catch((err) => {
                console.error(err);
                const rejectResponse = {
                    status: err.status,
                    message: err.message,
                };
                reject(rejectResponse);
                return;
            });
        }).catch((err) => {
            console.error(err);
            const rejectResponse = {
                status: err.status,
                message: err.message,
            };
            reject(rejectResponse);
            return;
        });
    });
};
