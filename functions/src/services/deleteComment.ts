import * as admin from "firebase-admin";
import {
  getBoardSnap,
  getCommentSnap,
  getListSnap,
  getTaskSnap,
  isOwner,
  isViewer,
} from "./dbUtils";
import { IDeleteCommentResponse } from "../dtos/responses";
import { IDeleteCommentRequest } from "../dtos/requests";

export const removeCommentService = (
  request: IDeleteCommentRequest,
  userId: string
): Promise<IDeleteCommentResponse> => {
  return new Promise((resolve, reject) => {
    if (request.boardId === "" || request.boardId === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(rejectResponse);
      return;
    }

    if (request.listId === "" || request.listId === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "List's id was empty or wasn't supplied.",
      };
      reject(rejectResponse);
      return;
    }

    if (request.taskId === "" || request.taskId === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "Task's id was empty or wasn't supplied.",
      };
      reject(rejectResponse);
      return;
    }

    if (request.commentId === "" || request.commentId === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "Comment's id was empty or wasn't supplied.",
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

    getBoardSnap(request.boardId, userId)
      .then((boardSnap) => {
        const isOwnerOfBoard = isOwner(boardSnap, userId);
        if (!isViewer(boardSnap, userId) && !isOwner) {
          const rejectResponse = {
            status: "permission-denied",
            message: "You don't have access to this board.",
          };
          reject(rejectResponse);
          return;
        }
        getListSnap(boardSnap, request.listId)
          .then((listSnap) => {
            getTaskSnap(listSnap, request.taskId)
              .then(() => {
                getCommentSnap(
                  request.boardId,
                  request.listId,
                  request.taskId,
                  request.commentId
                )
                  .then((commentSnap) => {
                    if (
                      commentSnap.data().authorId !== userId &&
                      !isOwnerOfBoard
                    ) {
                      const rejectResponse = {
                        status: "permission-denied",
                        message: "You don't have access to this comment.",
                      };
                      reject(rejectResponse);
                      return;
                    }

                    const batch = admin.firestore().batch();
                    batch.delete(commentSnap.ref);
                    batch
                      .commit()
                      .then(() => {
                        const response: IDeleteCommentResponse = { ...request };
                        resolve(response);
                        return;
                      })
                      .catch((err) => {
                        console.error(err);
                        const rejectResponse = {
                          status: "internal",
                          message:
                            "Comment wasn't deleted. There is a problem with the database. Please try again later.",
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
