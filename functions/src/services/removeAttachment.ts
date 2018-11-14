import * as admin from "firebase-admin";
import {getAttachmentSnap, getBoardSnap, getListSnap, getTaskSnap, isOwner} from "./dbUtils";
import {IRemoveAttachmentResponse} from "../dtos/responses";
import {IRemoveAttachmentRequest} from "../dtos/requests";

export const removeAttachmentService = (request: IRemoveAttachmentRequest, userId: string): Promise<IRemoveAttachmentResponse> => {
    return new Promise((resolve, reject) => {
        if (request.boardId === "" || request.boardId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Board's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (request.listId === "" || request.listId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "List's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (request.taskId === "" || request.taskId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Task's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (request.attachmentId === "" || request.attachmentId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Attachment's id was empty or wasn't supplied.",
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


        getBoardSnap(request.boardId, userId).then((boardSnap) => {
            if (!isOwner(boardSnap, userId)) {
                const rejectResponse = {
                    status: 'permission-denied',
                    message: "You don't have access to this board.",
                };
                reject(rejectResponse);
                return;
            }
            getListSnap(boardSnap, request.listId).then((listSnap) => {
                getTaskSnap(listSnap, request.taskId).then(() => {
                    getAttachmentSnap(request.boardId, request.listId, request.taskId, request.attachmentId).then((attachmentSnap) => {
                        const batch = admin.firestore().batch();
                        batch.delete(attachmentSnap.ref);
                        batch.commit().then(() => {
                            const response: IRemoveAttachmentResponse = {...request};
                            resolve(response);
                            return;
                        }).catch((err) => {
                            console.error(err);
                            const rejectResponse = {
                                status: "internal",
                                message: "Attachment wasn't deleted. There is a problem with the database. Please try again later.",
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