import * as admin from "firebase-admin";
import { deleteSubcollectionsService } from "./deleteSubcollections";
import { getBoardSnap, getPrevCurrentNextListSnaps } from "./dbUtils";

export const deleteListService = (boardId: string, listId: string, ownerId: string) => {
    return new Promise((resolve, reject) => {
        getBoardSnap(boardId, ownerId).then((boardSnap) => {
            console.log('got board snap of board ' + boardId);
            getPrevCurrentNextListSnaps(boardSnap, listId).then(({ prev, curr, next }) => {
                console.log('got prev curr next snaps of list ' + listId);

                const batch = admin.firestore().batch();

                if (prev !== null && next !== null) { //both exist
                    batch.update(prev.ref, { nextListId: next.id });
                    batch.update(next.ref, { prevListId: next.id });
                    batch.delete(curr.ref);
                } else if (prev !== null && next === null) { // only next exists
                    batch.update(prev.ref, { nextListId: "" });
                    batch.delete(curr.ref);
                } else if (prev === null && next !== null) { // only prev exists
                    batch.update(next.ref, { prevListId: "" });
                    batch.delete(curr.ref);
                } else if (prev === null && next === null) { // both dont exist
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
                reject("List doesn't exist.")
                return;
            })
        }).catch((err) => {
            console.log(err);
            reject("Board can't be accessed.")
            return;
        });
    });
}
