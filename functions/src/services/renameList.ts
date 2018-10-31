import { getBoardSnap, getListSnap } from "./dbUtils";

export const renameListService = (boardId: string, listId: string, listName: string, ownerId: string)
    : Promise<{ boardId: string, listId: string, listName: string }> => {
    return new Promise((resolve, reject) => {
        getBoardSnap(boardId, ownerId).then((boardSnap) => {
            getListSnap(boardSnap, listId).then((listSnap) => {
                if (listSnap !== null) {
                    listSnap.ref.update({ name: listName }).then(() => {
                        resolve({ boardId, listId, listName });
                        return;
                    }).catch((err) => {
                        console.log(err);
                        reject("List couldn't be renamed. Please contact our support staff.")
                        return;
                    });
                } else {
                    reject("List doesn't exist. Please contact our support staff.")
                    return;
                }
            }).catch((err) => {
                console.log(err);
                reject("List doesn't exist. Please contact our support staff.")
                return;
            });
        }).catch((err) => {
            console.log(err);
            reject("Board can't be accessed. Please contact our support staff.")
            return;
        });
    });
};