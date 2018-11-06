import * as admin from "firebase-admin";
import { IBoardMiniature } from "../dtos/IBoardMiniature";
import { isOwner, isMember } from "./dbUtils";

export const getBoardMiniaturesService = (userId: string): Promise<IBoardMiniature[]> => {
    return new Promise((resolve, reject) => {
        if (userId === "" || userId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "User's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        const boardsCollection = admin.firestore().collection("boards");
        boardsCollection
            .get()
            .then((querySnapshot) => {
                const boardMiniatures = [];
                querySnapshot.forEach((doc) => {
                    const isOwnedBoard = isOwner(doc, userId);

                    if (isOwnedBoard || isMember(doc, userId)) {
                        const boardMiniature: IBoardMiniature = {
                            id: doc.id,
                            name: doc.data().name,
                            owner: isOwnedBoard,
                        };

                        boardMiniatures.push(boardMiniature);
                    }
                })
                resolve(boardMiniatures);
                return;
            }).catch(err => {
                console.error(err);
                const rejectResponse = {
                    status: 'internal',
                    message: "Board miniatures were not fetched. There is a problem with the database. Please try again later.",
                };
                reject(rejectResponse);
                return;
            });
    });
}