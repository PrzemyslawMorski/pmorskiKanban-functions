import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import * as admin from "firebase-admin";

export const getBoardSnap = (boardId: string, ownerId: string): Promise<DocumentSnapshot> => {
    return new Promise((resolve, reject) => {
        const boardDoc = admin.firestore().collection("boards").doc(boardId);
        boardDoc.get().then((boardDocSnap) => {
            if (boardDocSnap.exists) {
                if (boardDocSnap.data().ownerId === ownerId) {
                    resolve(boardDocSnap);
                    return;
                } else {
                    reject("Board can't be accessed. Please contact the support staff.")
                    return;
                }
            } else {
                reject("Board can't be accessed. Please contact the support staff.")
                return;
            }
        }).catch((err) => {
            console.log(err);
            reject("Board can't be accessed. Please contact the support staff.")
            return;
        });
    });
};

export const getPrevCurrentNextListSnaps = (boardSnap: DocumentSnapshot, listId: string): Promise<{ prev: DocumentSnapshot, curr: DocumentSnapshot, next: DocumentSnapshot }> => {
    return new Promise((resolve, reject) => {
        getListSnap(boardSnap, listId).then((curr) => {
            const nextId = curr.data().nextListId;
            const prevId = curr.data().prevListId;

            getListSnap(boardSnap, prevId).then((prev) => {
                getListSnap(boardSnap, nextId).then((next) => {
                    resolve({ prev, curr, next });
                    return;
                }).catch((err) => {
                    console.log(err);
                    reject("List can't be accessed. Please contact the support staff.")
                    return;
                })
            }).catch((err) => {
                console.log(err);
                reject("List can't be accessed. Please contact the support staff.")
                return;
            })
        }).catch((err) => {
            console.log(err);
            reject("List can't be accessed. Please contact the support staff.")
            return;
        })
    });
}

export const getListSnap = (boardSnap: DocumentSnapshot, listId: string): Promise<DocumentSnapshot> => {
    return new Promise((resolve, reject) => {
        const listDoc = boardSnap.ref.collection("lists").doc(listId);
        listDoc.get().then((listDocSnap) => {
            resolve(listDocSnap);
        }).catch(err => {
            console.log(err);
            reject("List can't be accessed. Please contact the support staff.")
            return;
        });
    });
};
