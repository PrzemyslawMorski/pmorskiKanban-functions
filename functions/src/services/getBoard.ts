import {IBoard} from "../dtos/IBoard";
import {ITask} from "../dtos/ITask";
import {IList} from "../dtos/IList";
import {IGetBoardResponse} from "../dtos/responses";
import {getAttachments, getBoardSnap, getViewers, isOwner, isViewer} from "./dbUtils";
import {IUser} from "../dtos/IUser";
import {IAttachment} from "../dtos/IAttachment";

export const getBoardService = (boardId: string, userId: string): Promise<IGetBoardResponse> => {
    return new Promise((resolve, reject) => {
        if (boardId === "" || boardId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Board's id was empty or wasn't supplied.",
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
            if (!isViewer(boardSnap, userId) && !isOwner(boardSnap, userId)) {
                const rejectResponse = {
                    status: 'permission-denied',
                    message: "You don't have access to this board.",
                };
                reject(rejectResponse);
                return;
            }

            getAttachments(boardId).then((boardAttachments: IAttachment[]) => {
                const listsCollection = boardSnap.ref.collection("lists");

                listsCollection.get().then(listsQuerySnap => {
                    const getListsTasksCollections: Promise<FirebaseFirestore.QuerySnapshot>[] = [];
                    const lists: Array<IList> = [];

                    listsQuerySnap.forEach((listSnapshot) => {
                        getListsTasksCollections.push(listSnapshot.ref.collection("tasks").get());

                        const listData = listSnapshot.data();
                        const list: IList = {
                            id: listSnapshot.id,
                            name: listData.name,
                            boardId: boardSnap.id,
                            nextListId: listData.nextListId,
                            prevListId: listData.prevListId,
                            tasks: []
                        };

                        lists.push(list);
                    });

                    Promise.all(getListsTasksCollections).then((taskCollectionSnaps) => {
                        taskCollectionSnaps.forEach((taskCollection) => {
                            taskCollection.forEach((taskSnap) => {
                                const taskData = taskSnap.data();

                                const taskAttachments = boardAttachments
                                    .filter((attachment: IAttachment) => attachment.boardId === boardId)
                                    .filter((attachment: IAttachment) => attachment.listId === taskData.listId)
                                    .filter((attachment: IAttachment) => attachment.taskId === taskSnap.id);

                                const task: ITask = {
                                    id: taskSnap.id,
                                    name: taskData.name,
                                    description: taskData.description,
                                    listId: taskData.listId,
                                    nextTaskId: taskData.nextTaskId,
                                    prevTaskId: taskData.prevTaskId,
                                    attachments: taskAttachments,
                                };

                                const list = lists.find((someList) => someList.id === task.listId);

                                if (list !== undefined) {
                                    list.tasks.push(task);
                                }
                            });
                        });

                        getViewers(boardSnap.data().viewers).then((viewers: IUser[]) => {
                            const board: IBoard = {
                                id: boardSnap.id,
                                name: boardSnap.data().name,
                                owner: isOwner(boardSnap, userId),
                                lists,
                                viewers,
                            };

                            resolve({board});
                        }).catch(err => {
                            console.error(err);
                            const rejectResponse = {
                                status: 'internal',
                                message: "Board was not fetched. There is a problem with the database. Please try again later.",
                            };
                            reject(rejectResponse);
                            return;
                        });
                    }).catch((err) => {
                        console.error(err);
                        const rejectResponse = {
                            status: 'internal',
                            message: "Board was not fetched. There is a problem with the database. Please try again later.",
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
                    status: 'internal',
                    message: "Board was not fetched. There is a problem with the database. Please try again later.",
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
