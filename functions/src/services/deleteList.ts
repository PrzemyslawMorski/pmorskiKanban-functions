import * as admin from "firebase-admin";
import { deleteSubcollectionsService } from "./deleteSubcollections";
import { getBoardSnap, getPrevCurrentNextListSnaps, isOwner } from "./dbUtils";
import { IDeleteListResponse } from "../dtos/responses";
import { deleteAttachmentsForList } from "./deleteAttachments";
import { deleteCommentsForList } from "./deleteComments";

export const deleteListService = (
  boardId: string,
  listId: string,
  userId: string
): Promise<IDeleteListResponse> => {
  return new Promise((resolve, reject) => {
    if (boardId === "" || boardId === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(rejectResponse);
      return;
    }

    if (listId === "" || listId === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "List's id was empty or wasn't supplied.",
      };
      reject(rejectResponse);
      return;
    }

    if (userId === "" || userId === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "User's id was empty or wasn't supplied.",
      };
      reject(rejectResponse);
      return;
    }

    const response: IDeleteListResponse = {
      boardId: boardId,
      listId: listId,
    };

    getBoardSnap(boardId, userId)
      .then((boardSnap) => {
        if (!isOwner(boardSnap, userId)) {
          const rejectResponse = {
            status: "permission-denied",
            message: "You can't delete lists in a board you do not own.",
          };
          reject(rejectResponse);
          return;
        }

        getPrevCurrentNextListSnaps(boardSnap, listId)
          .then(({ prev, curr, next }) => {
            const batch = admin.firestore().batch();

            if (prev !== null && next !== null) {
              //both exist
              batch.update(prev.ref, { nextListId: next.id });
              batch.update(next.ref, { prevListId: next.id });
              batch.delete(curr.ref);
            } else if (prev !== null && next === null) {
              // only next exists
              batch.update(prev.ref, { nextListId: "" });
              batch.delete(curr.ref);
            } else if (prev === null && next !== null) {
              // only prev exists
              batch.update(next.ref, { prevListId: "" });
              batch.delete(curr.ref);
            } else if (prev === null && next === null) {
              // both dont exist
              batch.delete(curr.ref);
            }

            batch
              .commit()
              .then(() => {
                resolve(response);
                deleteAttachmentsForList(boardId, listId);
                deleteCommentsForList(boardId, listId);
                deleteSubcollectionsService(curr);
                return;
              })
              .catch((err) => {
                console.log(err);
                const rejectResponse = {
                  status: "internal",
                  message:
                    "List was not deleted. There is a problem with the database. Please try again later.",
                };
                reject(rejectResponse);
                return;
              });
          })
          .catch((err) => {
            console.error(err);
            const rejectResponse = {
              status: err.status,
              message: err.message,
            };
            reject(rejectResponse);
            return;
          });
      })
      .catch((err) => {
        console.error(err);
        const rejectResponse = {
          status: err.status,
          message: err.message,
        };
        reject(rejectResponse);
        return;
      });
  });
};
