import * as admin from "firebase-admin";
import {getAttachmentSnap, getBoardSnap, getListSnap, getTaskSnap, isOwner, isViewer} from "./dbUtils";
import {ICreateAttachmentResponse, ISetAttachmentUrlResponse} from "../dtos/responses";
import {IAddAttachmentRequest, ISetAttachmentUrlRequest} from "../dtos/requests";
import {IAttachment} from "../dtos/IAttachment";

export const addAttachmentService = (request: IAddAttachmentRequest, userId: string): Promise<ICreateAttachmentResponse> => {
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

        if (request.name === "" || request.name === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Attachment's name was empty or wasn't supplied.",
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
            if (!isViewer && !isOwner(boardSnap, userId)) {
                const rejectResponse = {
                    status: 'permission-denied',
                    message: "You don't have access to this board.",
                };
                reject(rejectResponse);
                return;
            }
            getListSnap(boardSnap, request.listId).then((listSnap) => {
                getTaskSnap(listSnap, request.taskId).then(() => {
                    console.log('got task snap');

                    const attachmentDoc = admin.firestore().collection("attachments").doc();
                    console.log('created attachment doc ' + attachmentDoc.id);

                    const attachmentData: IAttachment = {
                        id: attachmentDoc.id,
                        boardId: request.boardId,
                        listId: request.listId,
                        taskId: request.taskId,
                        name: request.name,
                        url: "",
                    };

                    const batch = admin.firestore().batch();
                    batch.set(attachmentDoc, attachmentData);

                    batch.commit().then(() => {
                        const response: ICreateAttachmentResponse = {
                            boardId: request.boardId,
                            listId: request.listId,
                            taskId: request.taskId,
                            attachmentId: attachmentDoc.id,
                        };

                        resolve(response);
                        return;
                    }).catch((err) => {
                        console.error(err);
                        const rejectResponse = {
                            status: "internal",
                            message: "Attachment wasn't created. There is a problem with the database. Please try again later.",
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

export const setAttachmentUrlService = (request: ISetAttachmentUrlRequest, userId: string): Promise<ISetAttachmentUrlResponse> => {
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

        if (request.url === "" || request.url === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Attachment's url was empty or wasn't supplied.",
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
            if (!isViewer && !isOwner(boardSnap, userId)) {
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
                        batch.update(attachmentSnap.ref, {url: request.url});

                        batch.commit().then(() => {
                            const attachment: IAttachment = {
                                id: request.attachmentId,
                                boardId: request.boardId,
                                listId: request.listId,
                                taskId: request.taskId,
                                name: attachmentSnap.data().name,
                                url: request.url,
                            };

                            const response: ISetAttachmentUrlResponse = {attachment};
                            resolve(response);
                            return;
                        }).catch((err) => {
                            console.error(err);
                            const rejectResponse = {
                                status: "internal",
                                message: "Attachment's url wasn't set. There is a problem with the database. Please try again later.",
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