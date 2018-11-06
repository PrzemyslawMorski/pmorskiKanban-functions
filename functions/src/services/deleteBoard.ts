import * as admin from "firebase-admin";
import { deleteSubcollectionsService } from "./deleteSubcollections";
import { getBoardSnap, isOwner } from "./dbUtils";
import { IDeleteBoardResponse } from "../dtos/responses";

export const deleteBoardService = (boardId: string, userId: string): Promise<IDeleteBoardResponse> => {
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

        const response: IDeleteBoardResponse = {
            boardId: boardId,
        }

        const boardsCollection = admin.firestore().collection("boards");
        const boardDoc = boardsCollection.doc(boardId);

        getBoardSnap(boardId, userId).then((boardSnap) => {
            if (!isOwner(boardSnap, userId)) {
                const rejectResponse = {
                    status: 'permission-denied',
                    message: "You can't delete a board you do not own.",
                };
                reject(rejectResponse);
                return;
            }

            boardDoc.delete().then(() => {
                deleteSubcollectionsService(boardSnap);
                resolve(response);
                return;
            }).catch(err => {
                console.error(err);
                const rejectResponse = {
                    status: 'internal',
                    message: "Board was not deleted. There is a problem with the database. Please try again later.",
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
