import * as admin from "firebase-admin";
import { IBoardMiniature } from "../dtos/IBoardMiniature";
import { getBoardMiniaturesService } from "./getBoardMiniatures";
import { deleteSubcollectionsService } from "./deleteSubcollections";
import { getBoardSnap } from "./dbUtils";

export const deleteBoardService = (boardId: string, ownerId: string): Promise<{ boardMiniatures: IBoardMiniature[] }> => {
    return new Promise((resolve, reject) => {
        const boardsCollection = admin.firestore().collection("boards");
        const boardDoc = boardsCollection.doc(boardId);

        getBoardSnap(boardId, ownerId).then((boardSnap) => {
            boardDoc.delete().then(() => {
                deleteSubcollectionsService(boardSnap);
                getBoardMiniaturesService(ownerId).then((boardMiniatures) => {
                    resolve({ boardMiniatures });
                    return;
                }).catch((err) => {
                    console.log(err);
                    reject("Board was deleted but there was an error getting your board miniatures. Please contact our support staff.");
                    return;
                });
            }).catch(err => {
                console.log(err);
                reject("Error deleting the board. Please contact the support staff.");
                return;
            });
        }).catch((err) => {
            console.log(err);
            reject("Board can't be accessed. Please contact the support staff.")
            return;
        })
    });
}
