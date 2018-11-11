import {getBoardSnap, getListSnap, getTaskSnap, isOwner} from "./dbUtils";
import {IChangeTaskDescriptionResponse} from "../dtos/responses";

export const changeTaskDescriptionService = (boardId: string, listId: string, taskId: string,
                                             newTaskDescription: string, userId: string)
    : Promise<IChangeTaskDescriptionResponse> => {
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

        if (taskId === "" || taskId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Task's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (newTaskDescription === "" || newTaskDescription === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Task's new description was empty or wasn't supplied.",
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
                    message: "You don't have access to this list.",
                };
                reject(rejectResponse);
                return;
            }

            getListSnap(boardSnap, listId).then((listSnap) => {

                getTaskSnap(listSnap, taskId).then((taskSnap) => {

                    taskSnap.ref.update({description: newTaskDescription}).then(() => {
                        const response: IChangeTaskDescriptionResponse = {
                            boardId,
                            listId,
                            taskId,
                            newTaskDescription,
                        };

                        resolve(response);
                        return;
                    }).catch((err) => {
                        console.log(err);
                        const rejectResponse = {
                            status: 'internal',
                            message: "Task's description was not changed. There is a problem with the database. Please try again later.",
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