import {IEditCommentRequest} from "../dtos/requests";
import {IEditCommentResponse} from "../dtos/responses";
import {getBoardSnap, getCommentSnap, getListSnap, getTaskSnap, isOwner, isViewer} from "./dbUtils";
import * as admin from "firebase-admin";
import {IComment} from "../dtos/IComment";
import {IUser} from "../dtos/IUser";

export const editCommentService = (request: IEditCommentRequest, userId: string): Promise<IEditCommentResponse> => {
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

        if (request.commentId === "" || request.commentId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Comment's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (request.newContent === "" || request.newContent === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Comment's new content was empty or wasn't supplied.",
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
            const isOwnerOfBoard = isOwner(boardSnap, userId);

            if (!isViewer && !isOwnerOfBoard) {
                const rejectResponse = {
                    status: 'permission-denied',
                    message: "You don't have access to this board.",
                };
                reject(rejectResponse);
                return;
            }
            getListSnap(boardSnap, request.listId).then((listSnap) => {
                getTaskSnap(listSnap, request.taskId).then(() => {
                    getCommentSnap(request.boardId, request.listId, request.taskId, request.commentId).then((commentSnap) => {
                        if (commentSnap.data().authorId !== userId && !isOwnerOfBoard) {
                            const rejectResponse = {
                                status: 'permission-denied',
                                message: "You don't have access to this comment.",
                            };
                            reject(rejectResponse);
                            return;
                        }

                        const batch = admin.firestore().batch();
                        batch.update(commentSnap.ref, {content: request.newContent});

                        batch.commit().then(() => {
                            admin.auth().getUser(commentSnap.data().authorId).then((authorRecord) => {
                                const author: IUser = {
                                    uid: authorRecord.uid,
                                    displayName: authorRecord.displayName,
                                    email: authorRecord.email,
                                    photoURL: authorRecord.photoURL,
                                };
                                const comment: IComment = {
                                    id: request.commentId,
                                    boardId: request.boardId,
                                    listId: request.listId,
                                    taskId: request.taskId,
                                    author: author,
                                    timestamp: commentSnap.data().timestamp,
                                    content: request.newContent,
                                };

                                const response: IEditCommentResponse = {comment: comment};
                                resolve(response);
                                return;
                            }).catch((err) => {
                                console.error(err);
                                const comment: IComment = {
                                    id: request.commentId,
                                    boardId: request.boardId,
                                    listId: request.listId,
                                    taskId: request.taskId,
                                    author: null,
                                    timestamp: commentSnap.data().timestamp,
                                    content: commentSnap.data().content,
                                };
                                const response: IEditCommentResponse = {comment: comment};
                                resolve(response);
                                return;
                            });
                        }).catch((err) => {
                            console.error(err);
                            const rejectResponse = {
                                status: "internal",
                                message: "Comment was not edited. There is a problem with the database. Please try again later.",
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