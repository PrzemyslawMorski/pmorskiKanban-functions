import {getBoardSnap, getListSnap, getPrevCurrentNextTaskSnaps, isOwner} from "./dbUtils";
import * as admin from "firebase-admin";
import {deleteSubcollectionsService} from "./deleteSubcollections";
import {IDeleteTaskResponse} from "../dtos/responses";
import {deleteAttachmentsForTask} from "./deleteAttachments";
import {deleteCommentsForTask} from "./deleteComments";

export const deleteTaskService = (boardId: string, listId: string, taskId: string, userId: string): Promise<IDeleteTaskResponse> => {
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
                    message: "You can't delete tasks in a board you do not own.",
                };
                reject(rejectResponse);
                return;
            }

            getListSnap(boardSnap, listId).then((listSnap) => {
                getPrevCurrentNextTaskSnaps(listSnap, taskId).then(({prev, curr, next}) => {

                    const batch = admin.firestore().batch();

                    if (prev !== null && next !== null) { //both exist
                        batch.update(prev.ref, {nextTaskId: next.id});
                        batch.update(next.ref, {prevTaskId: prev.id});
                        batch.delete(curr.ref);
                    } else if (prev === null && next !== null) { // first task deleted
                        batch.update(next.ref, {prevTaskId: ""});
                        batch.delete(curr.ref);
                    } else if (prev !== null && next === null) { // last task deleted
                        batch.update(prev.ref, {nextTaskId: ""});
                        batch.delete(curr.ref);
                    } else if (prev === null && next === null) { // only task deleted
                        batch.delete(curr.ref);
                    }

                    batch.commit().then(() => {
                        const response: IDeleteTaskResponse = {
                            boardId: boardId,
                            listId: listId,
                            taskId: taskId,
                        };

                        resolve(response);
                        deleteAttachmentsForTask(boardId, listId, taskId);
                        deleteCommentsForTask(boardId, listId, taskId);
                        deleteSubcollectionsService(curr);
                    }).catch((err) => {
                        console.log(err);
                        const rejectResponse = {
                            status: 'internal',
                            message: "Task was not deleted. There is a problem with the database. Please try again later.",
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