import * as admin from "firebase-admin";
import { IBoardMiniature } from "../dtos/IBoardMiniature";
import { getBoardMiniaturesService } from "./getBoardMiniatures";

export const deleteBoardService = (boardId: string, ownerId: string): Promise<{ boardMiniatures: IBoardMiniature[] }> => {
    return new Promise((resolve, reject) => {
        const boardsCollection = admin.firestore().collection("boards");
        const boardDoc = boardsCollection.doc(boardId);

        boardDoc.delete().then(() => {
            getBoardMiniaturesService(ownerId)
                .then((boardMiniatures) => {
                    resolve({ boardMiniatures });
                    return;
                })
                .catch((err) => {
                    console.log(err);
                    reject("Board was deleted but there was an error getting your board miniatures. Please contact our support staff.");
                    return;
                });
        }).catch(err => {
            console.log(err);
            reject("Error deleting the board. Please contact the support staff.");
            return;
        });
    });
}

export const deleteSubcollectionsService = (snap: FirebaseFirestore.DocumentSnapshot) => {
    snap.ref.getCollections()
        .then(collections => {
            collections.forEach(collection => {
                collection.get()
                    .then(docSnaps => {
                        docSnaps.forEach((docSnap => {
                            docSnap.ref.delete()
                                .then(() => {
                                    deleteSubcollectionsService(docSnap);
                                })
                                .catch((err) => {
                                    console.log(err);
                                    console.log('err while deleting docSnap ' + docSnap.id);
                                });
                        }))
                    })
                    .catch((err) => {
                        console.log(err);
                        console.log('err while getting docsnaps from collection ' + collection.id);
                    })
            })
        })
        .catch((err) => {
            console.log(err);
            console.log('err while getting collections from docsnap ' + snap.id);
        })
}
