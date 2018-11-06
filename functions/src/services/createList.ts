import * as admin from "firebase-admin";
import { IList } from "../dtos/IList";
import { getBoardSnap, isOwner } from "./dbUtils";
import { ICreateListResponse } from "../dtos/responses";

export const createListService = (boardId: string, listName: string, userId: string)
    : Promise<ICreateListResponse> => {
    return new Promise((resolve, reject) => {
        if (boardId === "" || boardId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Board's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (listName === "" || listName === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "List's name was empty or wasn't supplied.",
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

        const response: ICreateListResponse = {
            boardId: boardId,
            newList: null,
        };

        getBoardSnap(boardId, userId).then((boardSnap: FirebaseFirestore.DocumentSnapshot) => {
            if (!isOwner(boardSnap, userId)) {
                const rejectResponse = {
                    status: 'permission-denied',
                    message: "You can't create lists in a board you do not own.",
                };
                reject(rejectResponse);
                return;
            }

            const listsCollection = boardSnap.ref.collection("lists");

            listsCollection
                .where("nextListId", "==", "").get().then((querySnap: FirebaseFirestore.QuerySnapshot) => {
                    if (querySnap.empty) {
                        const newListRef = listsCollection.doc();
                        const Data = {
                            name: listName,
                            boardId: boardId,
                            prevListId: "",
                            nextListId: "",
                        };

                        newListRef.set(Data).then(() => {
                            const newList: IList = { ...Data, id: newListRef.id, tasks: [] };
                            response.newList = newList;
                            resolve(response);
                            return;
                        }).catch((err) => {
                            console.error(err);
                            const rejectResponse = {
                                status: 'internal',
                                message: "List was not created. There is a problem with the database. Please try again later.",
                            };
                            reject(rejectResponse);
                            return;
                        });
                    } else if (querySnap.size > 1) {
                        console.error("More than one list with nextListId == '' in board " + boardId);
                        const rejectResponse = {
                            status: 'internal',
                            message: "List was not created. There is a problem with the database. Please try again later.",
                        };
                        reject(rejectResponse);
                        return;
                    } else {
                        const lastList = querySnap.docs[0];
                        const newListData = {
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

                        batch.set(newListRef, newListData);
                        batch.update(lastList.ref, updateToLastList);

                        batch.commit().then(() => {
                            const newIList: IList = { ...newListData, id: newListRef.id, tasks: [] };
                            response.boardId = boardId;
                            response.newList = newIList;
                            resolve(response);
                            return;
                        }).catch((err) => {
                            console.error(err);
                            const rejectResponse = {
                                status: 'internal',
                                message: "List was not created. There is a problem with the database. Please try again later.",
                            };
                            reject(rejectResponse);
                            return;
                        });
                    }
                }).catch(err => {
                    console.error(err);
                    const rejectResponse = {
                        status: 'internal',
                        message: "List was not created. There is a problem with the database. Please try again later.",
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