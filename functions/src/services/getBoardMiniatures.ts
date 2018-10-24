import * as admin from "firebase-admin";
import { IBoardMiniature } from "../dtos/IBoardMiniature";

export const getBoardMiniaturesService = (userId: string): Promise<IBoardMiniature[]> => {
    return new Promise((resolve, reject) => {
        const boardsCollection = admin.firestore().collection("boards");
        boardsCollection
            .where("ownerId", "==", userId)
            .get()
            .then((querySnapshot) => {
                const boardMiniatures = [];
                querySnapshot.forEach((doc) => {
                    const docData = doc.data();
                    const boardMiniature: IBoardMiniature = {
                        id: doc.id,
                        name: docData.name,
                        ownerId: docData.ownerId,
                    };

                    boardMiniatures.push(boardMiniature);
                })
                resolve(boardMiniatures);
                return;
            });
    });
}