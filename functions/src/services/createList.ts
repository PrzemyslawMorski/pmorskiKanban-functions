import * as admin from "firebase-admin";
import { IList } from "../dtos/IList";

export const createListService = (boardId: string, listName: string, ownerId: string)
    : Promise<{ boardId: string, list: IList }> => {
    return new Promise((resolve, reject) => {
        admin.firestore().collection("boards").doc(boardId).get()
            .then((board) => {
                if (!board.exists) {
                    reject("Board doesn't exist.");
                    return;
                }

                if (board.data().ownerId !== ownerId) {
                    reject("Board can't be accessed.");
                    return;
                }

                const listsCollection = board.ref.collection("lists");

                listsCollection
                    .where("nextListId", "==", "").get()
                    .then((querySnap: FirebaseFirestore.QuerySnapshot) => {
                        if (querySnap.empty) {
                            const newList: FirebaseFirestore.DocumentData = {
                                name: listName,
                                boardId: boardId,
                                prevListId: "",
                                nextListId: "",
                            };

                            listsCollection.add(newList)
                                .then((newListRef: FirebaseFirestore.DocumentReference) => {
                                    newListRef.get()
                                        .then((newListDoc: FirebaseFirestore.DocumentSnapshot) => {
                                            const newListData = newListDoc.data();
                                            const newIList: IList = {
                                                id: newListRef.id,
                                                boardId: newListData.boardId,
                                                name: newListData.name,
                                                nextListId: newListData.nextListId,
                                                prevListId: newListData.prevListId,
                                                tasks: [],
                                            };

                                            resolve({ boardId: boardId, list: newIList });
                                            return;
                                        }).catch((err) => {
                                            reject("There was an error while creating your list. Please contact our support staff.");
                                            console.log(err);
                                            return;
                                        });
                                })
                                .catch((err) => {
                                    reject("There was an error while creating your list. Please contact our support staff.");
                                    console.log(err);
                                    return;
                                });
                        } else if (querySnap.size > 1) {
                            throw new Error("More than one list with nextListId == '' in board " + boardId);
                        } else {
                            const lastList = querySnap.docs[0];
                            const newList: FirebaseFirestore.DocumentData = {
                                name: listName,
                                boardId: boardId,
                                prevListId: lastList.id,
                                nextListId: "",
                            };

                            const newListRef = listsCollection.doc();

                            const updateToLastList = {
                                nextListId: newListRef.id,
                            };

                            const batch = admin.firestore().batch();

                            batch.set(newListRef, newList);
                            batch.update(lastList.ref, updateToLastList);

                            batch.commit()
                                .then(() => {
                                    newListRef.get()
                                        .then((newListDoc: FirebaseFirestore.DocumentSnapshot) => {
                                            const newListData: FirebaseFirestore.DocumentData = newListDoc.data();
                                            const newIList: IList = {
                                                id: newListRef.id,
                                                boardId: newListData.boardId,
                                                name: newListData.name,
                                                nextListId: newListData.nextListId,
                                                prevListId: newListData.prevListId,
                                                tasks: [],
                                            };

                                            resolve({ boardId: boardId, list: newIList });
                                            return;
                                        })
                                        .catch((err) => {
                                            reject("There was an error while creating your list. Please contact our support staff.");
                                            console.log(err);
                                            return;
                                        });
                                })
                                .catch((err) => {
                                    reject("There was an error while creating your list. Please contact our support staff.");
                                    console.log(err);
                                    return;
                                });
                        }
                    })
                    .catch(err => {
                        reject("There was an error while creating your list. Please contact our support staff.");
                        console.log(err);
                        return;
                    });
            }).catch((err) => {
                reject("There was an error while getting your board. Please contact our support staff.");
                console.log(err);
                return;
            });
    });
}