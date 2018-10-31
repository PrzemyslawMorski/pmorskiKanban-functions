import * as admin from "firebase-admin";
import { IBoardMiniature } from "../dtos/IBoardMiniature";
import { getBoardMiniaturesService } from "./getBoardMiniatures";
import { deleteSubcollectionsService } from "./deleteSubcollections";

export const deleteBoardService = (boardId: string, ownerId: string): Promise<{ boardMiniatures: IBoardMiniature[] }> => {
    return new Promise((resolve, reject) => {
        const boardsCollection = admin.firestore().collection("boards");
        const boardDoc = boardsCollection.doc(boardId);

        boardDoc.get()
            .then((boardDocSnap) => {
                if (boardDocSnap.exists) {
                    boardDoc.delete()
                        .then(() => {
                            deleteSubcollectionsService(boardDocSnap);

                            getBoardMiniaturesService(ownerId)
                                .then((boardMiniatures) => {
                                    resolve({ boardMiniatures });
                                    return;
                                })
                                .catch((err) => {
                                    console.log(err);
                                    reject("Board was deleted but there was an error getting your board miniatures. Please contact our support staff.");
                                    return;
                                });
                        }).catch(err => {
                            console.log(err);
                            reject("Error deleting the board. Please contact the support staff.");
                            return;
                        });
                } else {
                    reject("Board doesn't exist.")
                    return;
                }
            })
            .catch((err) => {
                console.log(err);
                reject("Board doesn't exist.")
                return;
            });
    });
}
