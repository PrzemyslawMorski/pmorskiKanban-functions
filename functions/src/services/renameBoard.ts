import { getBoardSnap, isOwner } from "./dbUtils";
import { IRenameBoardResponse } from "../dtos/responses";

export const renameBoardService = (boardId, boardName, userId): Promise<IRenameBoardResponse> => {
    return new Promise((resolve, reject) => {
        if (boardId === "" || boardId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Board's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (boardName === "" || boardName === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Board's name was empty or wasn't supplied.",
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

        const response: IRenameBoardResponse = {
            boardId: boardId,
            newBoardName: boardName,
        }

        getBoardSnap(boardId, userId).then((boardSnap) => {
            if (!isOwner(boardSnap, userId)) {
                const rejectResponse = {
                    status: 'permission-denied',
                    message: "You don't have access to this board.",
                };
                reject(rejectResponse);
                return;
            }

            boardSnap.ref.update({ name: boardName }).then(() => {
                resolve(response);
                return;
            }).catch(err => {
                console.error(err);
                const rejectResponse = {
                    status: 'internal',
                    message: "Board was not renamed. There is a problem with the database. Please try again later.",
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
}