import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";

export const getListSnap = (boardSnap: DocumentSnapshot, listId: string): Promise<DocumentSnapshot> => {
    return new Promise((resolve, reject) => {
        if (listId === "") {
            reject("No list id supplied");
            return;
        }

        const listDoc = boardSnap.ref.collection("lists").doc(listId);
        listDoc.get().then((listDocSnap) => {
            if (listDocSnap.exists) {
                resolve(listDocSnap);
            } else {
                reject("List " + listId + " doesn't exist.");
            }
        }).catch(err => {
            console.log("getListSnap" + err);
            reject("List " + listId + " doesn't exist.");
            return;
        });
    });
};

export const getBoardSnap = (boardId: string, ownerId: string): Promise<DocumentSnapshot> => {
    return new Promise((resolve, reject) => {
        const boardDoc = admin.firestore().collection("boards").doc(boardId);
        boardDoc.get().then((boardDocSnap) => {
            if (boardDocSnap.exists) {
                if (boardDocSnap.data().ownerId === ownerId) {
                    resolve(boardDocSnap);
                    return;
                } else {
                    reject("No access to board " + boardId + ".");
                    return;
                }
            } else {
                reject("Board " + boardId + " doesn't exist.");
                return;
            }
        }).catch((err) => {
            console.log("getBoardSnap" + err);
            reject("Board " + boardId + " doesn't exist.");
            return;
        });
    });
};

export const getPrevCurrentNextListSnaps = (boardSnap: DocumentSnapshot, listId: string)
    : Promise<{ prev: DocumentSnapshot, curr: DocumentSnapshot, next: DocumentSnapshot }> => {
    return new Promise((resolve, reject) => {
        getListSnap(boardSnap, listId).then((curr) => {
            const nextId = curr.data().nextListId;
            const prevId = curr.data().prevListId;

            getListSnap(boardSnap, prevId).then((prev) => {
                getListSnap(boardSnap, nextId).then((next) => {
                    resolve({ prev, curr, next });
                    return;
                }).catch((nextErr) => {
                    console.log("nextListId: " + nextId);
                    console.log("nextListError: " + nextErr);
                    resolve({ prev, curr, next: null });
                    return;
                })
            }).catch((prevErr) => {
                console.log("prevListId: " + prevId);
                console.log("prevListError: " + prevErr);
                getListSnap(boardSnap, nextId).then((next) => {
                    resolve({ prev: null, curr, next });
                    return;
                }).catch((nextErr) => {
                    console.log("nextListId: " + nextId);
                    console.log("nextListError: " + nextErr);
                    resolve({ prev: null, curr, next: null });
                    return;
                })
                return;
            })
        }).catch((currErr) => {
            console.log("currentListId: " + listId);
            console.log("currentListError: " + currErr);
            reject("Error getting list from database");
            return;
        })
    });
}


