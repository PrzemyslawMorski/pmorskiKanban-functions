import * as admin from "firebase-admin";
import { IBoardMiniature } from "../dtos/IBoardMiniature";
import { IBoard } from "../dtos/IBoard";
import { getBoardMiniaturesService } from "./getBoardMiniatures";

export const createBoardService = (boardName: string, ownerId: string): Promise<{ board: IBoard, boardMiniatures: IBoardMiniature[] }> => {
    return new Promise((resolve, reject) => {
        const boardsCollection = admin.firestore().collection("boards");

        const boardData = {
            name: boardName,
            ownerId: ownerId,
        };

        boardsCollection.add(boardData)
            .then((boardRef) => {
                const board: IBoard = {
                    id: boardRef.id,
                    name: boardName,
                    ownerId: ownerId,
                    lists: [],
                };

                getBoardMiniaturesService(ownerId)
                    .then((boardMiniatures) => {
                        resolve({ board, boardMiniatures });
                        return;
                    })
                    .catch((error) => {
                        console.log(error);
                        reject("Board was created but there was an error getting your board miniatures. Please contact our support staff.");
                        return;
                    });
            })
            .catch((error) => {
                console.log(error);
                reject("Error creating board. Please contact our support staff.");
                return;
            });
    });
}