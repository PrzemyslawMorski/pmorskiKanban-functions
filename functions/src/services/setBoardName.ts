import * as admin from "firebase-admin";

export const setBoardNameService = (boardId, boardName, userId) => {
    return new Promise((resolve, reject) => {
        if (boardId === "" || boardName === "" || userId === "") {
            reject("Board id, name or userId is empty.");
            return;
        }

        const boardDocRef = admin.firestore()
            .collection("boards")
            .doc(boardId);

        boardDocRef.get()
            .then((boardDoc) => {
                if (boardDoc.exists) {
                    if (boardDoc.data().ownerId !== userId) {
                        reject("Board can't be accessed.");
                        return;
                    }

                    boardDoc.ref.update({ name: boardName })
                        .then(() => {
                            resolve(boardName);
                            return;
                        })
                        .catch((error) => {
                            console.log(error);
                            reject("Error changing board's name.");
                            return;
                        });

                } else {
                    reject("Board doesn't exist.")
                    return;
                }
            })
            .catch((error) => {
                console.log("Error getting board: ", error);
                reject(error)
                return;
            });

    });
}