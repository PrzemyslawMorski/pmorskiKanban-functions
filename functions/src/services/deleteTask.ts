import { getBoardSnap, getListSnap, getPrevCurrentNextTaskSnaps } from "./dbUtils";
import * as admin from "firebase-admin";
import { deleteSubcollectionsService } from "./deleteSubcollections";

export const deleteTaskService = (boardId: string, listId: string, taskId: string, ownerId: string) => {
    return new Promise((resolve, reject) => {
        getBoardSnap(boardId, ownerId).then((boardSnap) => {
            getListSnap(boardSnap, listId).then((listSnap) => {
                if (taskId === "") {
                    reject("No task id supplied");
                    return;
                }

                getPrevCurrentNextTaskSnaps(listSnap, taskId).then(({ prev, curr, next }) => {
                    console.log('got prev curr next snaps of list ' + listId);

                    const batch = admin.firestore().batch();

                    if (prev !== null && next !== null) { //both exist
                        batch.update(prev.ref, { nextTaskId: next.id });
                        batch.update(next.ref, { prevTaskId: next.id });
                        batch.delete(curr.ref);
                    } else if (prev !== null && next === null) { // only next exists
                        batch.update(prev.ref, { nextTaskId: "" });
                        batch.delete(curr.ref);
                    } else if (prev === null && next !== null) { // only prev exists
                        batch.update(next.ref, { prevTaskId: "" });
                        batch.delete(curr.ref);
                    } else if (prev === null && next === null) { // both dont exist
                        batch.delete(curr.ref);
                    }

                    batch.commit().then(() => {
                        resolve({ boardId, listId, taskId });
                        deleteSubcollectionsService(curr);
                    }).catch((err) => {
                        console.log(err);
                        reject("Task couldn't be deleted.")
                        return;
                    });
                }).catch((err) => {
                    console.log(err);
                    reject("Task doesn't exist.")
                    return;
                });

            }).catch((err) => {
                reject("Error deleting task. Please contact our support staff.");
                console.error(err);
                return;
            });
        }).catch((err) => {
            reject(err);
            console.log(err);
            return;
        });
    });
};