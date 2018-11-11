import * as admin from "firebase-admin";
import {getBoardSnap, getPrevCurrentNextListSnaps, getTwoListSnaps, isOwner} from "./dbUtils";
import {IMoveListResponse} from "../dtos/responses";
import {IMoveListRequest} from "../dtos/requests";

export const moveListService = (request: IMoveListRequest, userId: string)
    : Promise<IMoveListResponse> => {
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

        if (request.targetPrevListId !== "" && request.targetNextListId !== "" && request.targetPrevListId === request.targetNextListId) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "The database is out of sync with your view. Please refresh the page to update your view of the board.",
            };
            reject(rejectResponse);
            return;
        }

        if (request.srcPrevListId !== "" && request.srcNextListId !== "" && request.srcPrevListId === request.srcNextListId) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "The database is out of sync with your view. Please refresh the page to update your view of the board.",
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

        if (userId === "" || userId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "User's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (request.srcPrevListId === request.targetPrevListId && request.srcNextListId === request.targetNextListId) {
            const response: IMoveListResponse = {
                boardId: request.boardId,
                listId: request.listId,
            };
            resolve(response);
            return;
        }

        if ((request.srcPrevListId === request.targetPrevListId && request.srcNextListId !== request.targetNextListId) ||
            (request.srcPrevListId !== request.targetPrevListId && request.srcNextListId === request.targetNextListId)) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "The database is out of sync with your view. Please refresh the page to update your view of the board.",
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

            getPrevCurrentNextListSnaps(boardSnap, request.listId).then((prevCurrNext) => {
                const oldPrev = prevCurrNext.prev;
                const oldNext = prevCurrNext.next;
                const movedList = prevCurrNext.curr;

                const oldPrevId = oldPrev !== null ? oldPrev.id : "";
                const oldNextId = oldNext !== null ? oldNext.id : "";

                if (oldPrevId !== request.srcPrevListId || oldNextId !== request.srcNextListId) {
                    const rejectResponse = {
                        status: 'invalid-argument',
                        message: "The database is out of sync with your view. Please refresh the page to update your view of the board.",
                    };
                    reject(rejectResponse);
                    return;
                }

                getTwoListSnaps(boardSnap, request.targetPrevListId, request.targetNextListId).then((firstSecond) => {
                    const targetPrev = firstSecond.first;
                    const targetNext = firstSecond.second;


                    const targetPrevId = targetPrev !== null ? targetPrev.id : "";
                    const targetNextId = targetNext !== null ? targetNext.id : "";

                    if ((targetPrev === null && targetNext === null) || (targetPrev !== null && targetPrev.data().nextListId !== targetNextId) ||
                        (targetNext !== null && targetNext.data().prevListId !== targetPrevId)) {
                        const rejectResponse = {
                            status: 'invalid-argument',
                            message: "The database is out of sync with your view. Please refresh the page to update your view of the board.",
                        };
                        reject(rejectResponse);
                        return;
                    }

                    const batch = admin.firestore().batch();

                    if (oldPrev !== null) {
                        batch.update(oldPrev.ref, {nextListId: oldNextId});
                    }

                    if (oldNext !== null) {
                        batch.update(oldNext.ref, {prevListId: oldPrevId});
                    }

                    if (targetPrev !== null) {
                        batch.update(targetPrev.ref, {nextListId: request.listId});
                    }

                    if (targetNext !== null) {
                        batch.update(targetNext.ref, {prevListId: request.listId});
                    }

                    batch.update(movedList.ref, {prevListId: targetPrevId, nextListId: targetNextId});

                    batch.commit().then(() => {
                        const response: IMoveListResponse = {
                            boardId: request.boardId,
                            listId: request.listId,
                        };
                        resolve(response);
                        return;
                    }).catch((err) => {
                        console.error(err);
                        const rejectResponse = {
                            status: "internal",
                            message: "List was not moved. There was an error with the database. Please try again later.",
                        };
                        reject(rejectResponse);
                        return;
                    })
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
            })
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