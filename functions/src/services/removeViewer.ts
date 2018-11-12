import * as admin from "firebase-admin";
import {getBoardSnap, isOwner} from "./dbUtils";
import {IRemoveViewerResponse} from "../dtos/responses";
import {IRemoveViewerRequest} from "../dtos/requests";

export const removeViewerService = (request: IRemoveViewerRequest, userId: string): Promise<IRemoveViewerResponse> => {
    return new Promise((resolve, reject) => {
        if (request.boardId === "" || request.boardId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Board's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (request.userId === "" || request.userId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Viewer's id was empty or wasn't supplied.",
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

        const response: IRemoveViewerResponse = {
            boardId: request.boardId,
            userId: request.userId,
        };

        getBoardSnap(request.boardId, userId).then((boardSnap) => {
            if (!isOwner(boardSnap, userId)) {
                const rejectResponse = {
                    status: 'permission-denied',
                    message: "You don't have access to this board.",
                };
                reject(rejectResponse);
                return;
            }

            admin.auth().getUser(request.userId).then(() => {
                const batch = admin.firestore().batch();

                const newViewers = boardSnap.data().viewers;
                const indexOfDeletedViewer = newViewers.indexOf(request.userId);
                if (indexOfDeletedViewer === -1) { // already removed the viewer
                    resolve(response);
                    return;
                }

                newViewers.splice(indexOfDeletedViewer, 1);
                batch.update(boardSnap.ref, {viewers: newViewers});

                batch.commit().then(() => {
                    resolve(response);
                    return;
                }).catch((err) => {
                    console.error(err);
                    const rejectResponse = {
                        status: 'internal',
                        message: "Viewer was not removed. There is a problem with the database. Please try again later.",
                    };
                    reject(rejectResponse);
                    return;
                });
            }).catch((err) => {
                if (err.code === "auth/user-not-found") {
                    console.error(err);
                    const rejectResponse = {
                        status: 'not-found',
                        message: "Viewer was not found. There is a problem with the database. Please try again later.",
                    };
                    reject(rejectResponse);
                    return;
                } else {
                    console.error(err);
                    const rejectResponse = {
                        status: 'internal',
                        message: "Viewer was not removed. There is a problem with the database. Please try again later.",
                    };
                    reject(rejectResponse);
                    return;
                }
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