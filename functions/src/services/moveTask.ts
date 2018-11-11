import {getBoardSnap, isOwner} from "./dbUtils";
import {IMoveTaskResponse} from "../dtos/responses";
import {IMoveTaskRequest} from "../dtos/requests";

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

        if (userId === "" || userId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "User's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        // const response: IMoveTaskResponse = {
        //     boardId: request.boardId,
        //     listId: request.listId,
        //     targetListId: request.targetListId,
        //     taskId: request.taskId,
        // };

        getBoardSnap(request.boardId, userId).then((boardSnap) => {
            if (!isOwner(boardSnap, userId)) {
                const rejectResponse = {
                    status: 'permission-denied',
                    message: "You don't have access to this board.",
                };
                reject(rejectResponse);
                return;
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