import * as admin from "firebase-admin";
import { IBoard } from "../dtos/IBoard";
import { ICreateBoardResponse } from "../dtos/responses";

export const createBoardService = (boardName: string, userId: string): Promise<ICreateBoardResponse> => {
    return new Promise((resolve, reject) => {
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

        const response: ICreateBoardResponse = {
            newBoard: null,
        };

        const boardsCollection = admin.firestore().collection("boards");
        const boardData = {
            name: boardName,
            ownerId: userId,
            members: [userId],
        };

        const boardRef = boardsCollection.doc();

        boardRef.set(boardData).then(() => {
            const board: IBoard = {
                id: boardRef.id,
                name: boardName,
                owner: true,
                lists: [],
            };

            response.newBoard = board;
            resolve(response);
        }).catch((error) => {
            console.error("Error setting board data in board " + boardRef.id);
            console.error(error);

            boardRef.delete().catch((deleteErr) => {
                console.error("Error deleting board " + boardRef.id);
                console.error(deleteErr);
            });

            const rejectResponse = {
                status: 'internal',
                message: "Board was not created. There is a problem with the database. Please try again later.",
            };
            reject(rejectResponse);
            return;
        });
    });
}