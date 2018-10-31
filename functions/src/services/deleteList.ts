import * as admin from "firebase-admin";
import { deleteSubcollectionsService } from "./deleteSubcollections";
import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";

export const deleteListService = (boardId: string, listId: string, ownerId: string) => {
    return new Promise((resolve, reject) => {
        getBoardSnap(boardId, ownerId).then((boardSnap) => {
            getPrevCurrentNextListSnaps(boardSnap, listId).then(({ prev, curr, next }) => {
                const batch = admin.firestore().batch();

                if (prev.exists && next.exists) {
                    batch.update(prev.ref, { nextListId: next.id });
                    batch.update(next.ref, { prevListId: next.id });
                    batch.delete(curr.ref);
                } else if (prev.exists && !next.exists) {
                    batch.update(prev.ref, { nextListId: "" });
                    batch.delete(curr.ref);
                } else if (!prev.exists && next.exists) {
                    batch.update(next.ref, { prevListId: "" });
                    batch.delete(curr.ref);
                } else if (!prev.exists && !next.exists) {
                    batch.delete(curr.ref);
                }

                batch.commit().then(() => {
                    resolve({ boardId, listId });
                    deleteSubcollectionsService(curr);
                }).catch((err) => {
                    console.log(err);
                    reject("List couldn't be deleted.")
                    return;
                });
            }).catch((err) => {
                console.log(err);
                reject("List can't be accessed.")
                return;
            })
        }).catch((err) => {
            console.log(err);
            reject("List can't be accessed.")
            return;
        });
    });
}

const getBoardSnap = (boardId: string, ownerId: string): Promise<DocumentSnapshot> => {
    return new Promise((resolve, reject) => {
        const boardDoc = admin.firestore().collection("boards").doc(boardId);
        boardDoc.get().then((boardDocSnap) => {
            if (boardDocSnap.exists) {
                if (boardDocSnap.data().ownerId === ownerId) {
                    resolve(boardDocSnap);
                    return;
                } else {
                    reject("Board can't be accessed.")
                    return;
                }
            } else {
                reject("Board can't be accessed.")
                return;
            }
        }).catch((err) => {
            console.log(err);
            reject("Board can't be accessed.")
            return;
        });
    });
};

const getPrevCurrentNextListSnaps = (boardSnap: DocumentSnapshot, listId: string): Promise<{ prev: DocumentSnapshot, curr: DocumentSnapshot, next: DocumentSnapshot }> => {
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
                    reject("List can't be accessed.")
                    return;
                })
            }).catch((err) => {
                console.log(err);
                reject("List can't be accessed.")
                return;
            })
        }).catch((err) => {
            console.log(err);
            reject("List can't be accessed.")
            return;
        })
    });
}

const getListSnap = (boardSnap: DocumentSnapshot, listId: string): Promise<DocumentSnapshot> => {
    return new Promise((resolve, reject) => {
        const listDoc = boardSnap.ref.collection("lists").doc(listId);
        listDoc.get().then((listDocSnap) => {
            resolve(listDocSnap);
        }).catch(err => {
            console.log(err);
            reject("List can't be accessed.")
            return;
        });
    });
};
