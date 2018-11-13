import {
    getAttachmentDocsForTask,
    getBoardSnap,
    getListSnap,
    getPrevCurrentNextTaskSnaps,
    getTwoListSnaps,
    getTwoTaskSnaps,
    isOwner
} from "./dbUtils";
import {IMoveTaskResponse} from "../dtos/responses";
import {IMoveTaskRequest} from "../dtos/requests";
import * as admin from "firebase-admin";

export const moveTaskService = (request: IMoveTaskRequest, userId: string): Promise<IMoveTaskResponse> => {
    return new Promise((resolve, reject) => {
        if (request.boardId === "" || request.boardId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Board's id was empty or wasn't supplied.",
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

        if (request.listId === "" || request.listId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Source list's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (request.targetListId === "" || request.targetListId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Target list's id was empty or wasn't supplied.",
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

        // one src matches target but the other doesnt
        if ((request.targetListId === request.listId && request.srcPrevTaskId === request.targetPrevTaskId && request.srcNextTaskId !== request.targetNextTaskId) ||
            (request.targetListId === request.listId && request.srcPrevTaskId !== request.targetPrevTaskId && request.srcNextTaskId === request.targetNextTaskId)) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "The database is out of sync with your view. Please refresh the page to update your view of the board.",
            };
            reject(rejectResponse);
            return;
        }

        // srcs are equal
        if (request.srcNextTaskId !== "" && request.srcPrevTaskId !== "" && request.srcPrevTaskId === request.srcNextTaskId) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "The database is out of sync with your view. Please refresh the page to update your view of the board.",
            };
            reject(rejectResponse);
            return;
        }

        // targets are equal
        if (request.targetPrevTaskId !== "" && request.targetNextTaskId !== "" && request.targetPrevTaskId === request.targetNextTaskId) {
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

            if (request.listId === request.targetListId) {
                getListSnap(boardSnap, request.listId).then((srcListSnap) => {
                    getPrevCurrentNextTaskSnaps(srcListSnap, request.taskId).then((prevCurrNext) => {
                        const oldPrevTask = prevCurrNext.prev;
                        const oldNextTask = prevCurrNext.next;
                        const movedTask = prevCurrNext.curr;

                        const oldPrevId = oldPrevTask !== null ? oldPrevTask.id : "";
                        const oldNextId = oldNextTask !== null ? oldNextTask.id : "";

                        if (oldPrevId !== request.srcPrevTaskId || oldNextId !== request.srcNextTaskId) {
                            const rejectResponse = {
                                status: 'invalid-argument',
                                message: "The database is out of sync with your view. Please refresh the page to update your view of the board.",
                            };
                            reject(rejectResponse);
                            return;
                        }

                        // task wasn't moved
                        if (oldPrevId === request.targetPrevTaskId && oldNextId === request.targetNextTaskId) {
                            const response: IMoveTaskResponse = {
                                boardId: request.boardId,
                                listId: request.listId,
                                taskId: request.taskId,
                                targetListId: request.targetListId,
                            };
                            resolve(response);
                            return;
                        }

                        getTwoTaskSnaps(srcListSnap, request.targetPrevTaskId, request.targetNextTaskId).then((firstSecond) => {
                            const targetPrev = firstSecond.first;
                            const targetNext = firstSecond.second;

                            const targetPrevId = targetPrev !== null ? targetPrev.id : "";
                            const targetNextId = targetNext !== null ? targetNext.id : "";

                            if ((targetPrev === null && targetNext === null) || (targetPrev !== null && targetPrev.data().nextTaskId !== targetNextId) ||
                                (targetNext !== null && targetNext.data().prevTaskId !== targetPrevId)) {
                                const rejectResponse = {
                                    status: 'invalid-argument',
                                    message: "The database is out of sync with your view. Please refresh the page to update your view of the board.",
                                };
                                reject(rejectResponse);
                                return;
                            }

                            const batch = admin.firestore().batch();

                            if (oldPrevTask !== null) {
                                batch.update(oldPrevTask.ref, {nextTaskId: oldNextId});
                            }

                            if (oldNextTask !== null) {
                                batch.update(oldNextTask.ref, {prevTaskId: oldPrevId});
                            }

                            if (targetPrev !== null) {
                                batch.update(targetPrev.ref, {nextTaskId: request.taskId});
                            }

                            if (targetNext !== null) {
                                batch.update(targetNext.ref, {prevTaskId: request.taskId});
                            }

                            batch.update(movedTask.ref, {prevTaskId: targetPrevId, nextTaskId: targetNextId});

                            batch.commit().then(() => {
                                const response: IMoveTaskResponse = {
                                    boardId: request.boardId,
                                    listId: request.listId,
                                    targetListId: request.targetListId,
                                    taskId: request.taskId,
                                };
                                resolve(response);
                                return;
                            }).catch((err) => {
                                console.error(err);
                                const rejectResponse = {
                                    status: "internal",
                                    message: "Task was not moved. There was an error with the database. Please try again later.",
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
            } else {
                getTwoListSnaps(boardSnap, request.listId, request.targetListId).then((firstSecond) => {
                    const srcListSnap = firstSecond.first;
                    const targetListSnap = firstSecond.second;

                    if (srcListSnap === null || targetListSnap === null) {
                        const rejectResponse = {
                            status: 'invalid-argument',
                            message: "The database is out of sync with your view. Please refresh the page to update your view of the board.",
                        };
                        reject(rejectResponse);
                        return;
                    }

                    getPrevCurrentNextTaskSnaps(srcListSnap, request.taskId).then((prevCurrNext) => {
                        const oldPrevTask = prevCurrNext.prev;
                        const oldNextTask = prevCurrNext.next;
                        const movedTask = prevCurrNext.curr;

                        const oldPrevId = oldPrevTask !== null ? oldPrevTask.id : "";
                        const oldNextId = oldNextTask !== null ? oldNextTask.id : "";

                        if (oldPrevId !== request.srcPrevTaskId || oldNextId !== request.srcNextTaskId) {
                            const rejectResponse = {
                                status: 'invalid-argument',
                                message: "The database is out of sync with your view. Please refresh the page to update your view of the board.",
                            };
                            reject(rejectResponse);
                            return;
                        }

                        getTwoTaskSnaps(targetListSnap, request.targetPrevTaskId, request.targetNextTaskId).then((firstSecondTasks) => {
                            const targetPrev = firstSecondTasks.first;
                            const targetNext = firstSecondTasks.second;

                            const targetPrevId = targetPrev !== null ? targetPrev.id : "";
                            const targetNextId = targetNext !== null ? targetNext.id : "";

                            targetListSnap.ref.collection("tasks").get().then((colSnap) => {
                                if ((!colSnap.empty && targetListSnap && targetPrev === null && targetNext === null) ||
                                    (targetPrev !== null && targetPrev.data().nextTaskId !== targetNextId) ||
                                    (targetNext !== null && targetNext.data().prevTaskId !== targetPrevId)) {
                                    const rejectResponse = {
                                        status: 'invalid-argument',
                                        message: "The database is out of sync with your view. Please refresh the page to update your view of the board.",
                                    };
                                    reject(rejectResponse);
                                    return;
                                }

                                getAttachmentDocsForTask(request.boardId, request.listId, request.taskId).then((attachmentDocs) => {
                                    const batch = admin.firestore().batch();

                                    attachmentDocs.forEach((attachmentDoc) => {
                                        batch.update(attachmentDoc.ref, {listId: request.targetListId});
                                    });

                                    if (oldPrevTask !== null) {
                                        batch.update(oldPrevTask.ref, {nextTaskId: oldNextId});
                                    }

                                    if (oldNextTask !== null) {
                                        batch.update(oldNextTask.ref, {prevTaskId: oldPrevId});
                                    }

                                    if (targetPrev !== null) {
                                        batch.update(targetPrev.ref, {nextTaskId: request.taskId});
                                    }

                                    if (targetNext !== null) {
                                        batch.update(targetNext.ref, {prevTaskId: request.taskId});
                                    }

                                    const movedTaskData = movedTask.data();
                                    const newMovedTaskData = {
                                        name: movedTaskData.name,
                                        description: movedTaskData.description,
                                        listId: request.targetListId,
                                        prevTaskId: targetPrevId,
                                        nextTaskId: targetNextId
                                    };

                                    const taskDocMovedToTargetList = targetListSnap.ref.collection("tasks").doc(request.taskId);
                                    batch.set(taskDocMovedToTargetList, newMovedTaskData);

                                    batch.delete(movedTask.ref);

                                    batch.commit().then(() => {
                                        const response: IMoveTaskResponse = {
                                            boardId: request.boardId,
                                            listId: request.listId,
                                            targetListId: request.targetListId,
                                            taskId: request.taskId,
                                        };
                                        resolve(response);
                                        return;
                                    }).catch((err) => {
                                        console.error(err);
                                        const rejectResponse = {
                                            status: "internal",
                                            message: "Task was not moved. There was an error with the database. Please try again later.",
                                        };
                                        reject(rejectResponse);
                                        return;
                                    });
                                }).catch((err) => {
                                    console.error(err);
                                    const rejectResponse = {
                                        status: "internal",
                                        message: "Task was not moved. There was an error with the database. Please try again later.",
                                    };
                                    reject(rejectResponse);
                                    return;
                                });
                            }).catch((err) => {
                                console.error(err);
                                const rejectResponse = {
                                    status: "internal",
                                    message: "Task was not moved. There was an error with the database. Please try again later.",
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
            }
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