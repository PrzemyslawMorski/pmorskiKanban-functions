import { getBoardSnap, getListSnap, isOwner } from "./dbUtils";
import { IRenameListResponse } from "../dtos/responses";

export const renameListService = (boardId: string, listId: string, listName: string, userId: string)
    : Promise<IRenameListResponse> => {
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

        if (listName === "" || listName === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "List's name was empty or wasn't supplied.",
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
                listSnap.ref.update({ name: listName }).then(() => {
                    const response: IRenameListResponse = {
                        boardId: boardId,
                        listId: listId,
                        newListName: listName,
                    };

                    resolve(response);
                    return;
                }).catch((err) => {
                    console.log(err);
                    const rejectResponse = {
                        status: 'internal',
                        message: "List was not renamed.There is a problem with the database.Please try again later.",
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