import * as admin from "firebase-admin";
import { deleteSubcollectionsService } from "./deleteSubcollections";
import { getBoardSnap, getPrevCurrentNextListSnaps } from "./dbUtils";

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
