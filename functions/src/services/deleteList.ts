import * as admin from "firebase-admin";
import { deleteSubcollectionsService } from "./deleteSubcollections";

export const deleteListService = (boardId: string, listId: string, ownerId: string) => {
    return new Promise((resolve, reject) => {
        const boardDoc = admin.firestore().collection("boards").doc(boardId);

        boardDoc.get()
            .then((boardDocSnap) => {
                if (boardDocSnap.exists) {
                    if (boardDocSnap.data().ownerId === ownerId) {
                        const listDoc = boardDoc.collection("lists").doc(listId);
                        listDoc.get()
                            .then((listDocSnap) => {
                                if (listDocSnap.exists) {
                                    listDoc.delete()
                                        .then(() => {
                                            deleteSubcollectionsService(listDocSnap);
                                            resolve({ boardId, listId });
                                            return;
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                            reject("List couldn't be deleted. Please contact our support staff.");
                                            return;
                                        });
                                } else {
                                    reject("List doesn't exist.")
                                    return;
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                                reject("List doesn't exist.")
                                return;
                            });
                    } else {
                        reject("Board can't be accessed");
                        return;
                    }
                } else {
                    reject("Board doesn't exist");
                    return;
                }
            })
            .catch((err) => {
                console.log(err);
                reject("Board doesn't exist.")
                return;
            })
    });
};