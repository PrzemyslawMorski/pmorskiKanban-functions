import * as admin from "firebase-admin";
import {
  getBoardSnap,
  getListSnap,
  getTaskSnap,
  isOwner,
  isViewer,
} from "./dbUtils";
import { IAddCommentResponse } from "../dtos/responses";
import { IAddCommentRequest } from "../dtos/requests";
import { IComment } from "../dtos/IComment";
import { IUser } from "../dtos/IUser";

export const addCommentService = (
  request: IAddCommentRequest,
  userId: string
): Promise<IAddCommentResponse> => {
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

    if (request.content === "" || request.content === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "Comment's content was empty or wasn't supplied.",
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
        if (!isViewer && !isOwner(boardSnap, userId)) {
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
                admin
                  .auth()
                  .getUser(userId)
                  .then((authorRecord) => {
                    const commentDoc = admin
                      .firestore()
                      .collection("comments")
                      .doc();
                    const commentData = {
                      id: commentDoc.id,
                      boardId: request.boardId,
                      listId: request.listId,
                      taskId: request.taskId,
                      content: request.content,
                      timestamp: Date.now(),
                      authorId: userId,
                    };

                    const batch = admin.firestore().batch();
                    batch.set(commentDoc, commentData);

                    batch
                      .commit()
                      .then(() => {
                        const author: IUser = {
                          uid: authorRecord.uid,
                          displayName: authorRecord.displayName,
                          email: authorRecord.email,
                          photoURL: authorRecord.photoURL,
                        };
                        const comment: IComment = {
                          id: commentDoc.id,
                          boardId: request.boardId,
                          listId: request.listId,
                          taskId: request.taskId,
                          author: author,
                          timestamp: commentData.timestamp,
                          content: commentData.content,
                        };

                        const response: IAddCommentResponse = {
                          comment: comment,
                        };
                        resolve(response);
                        return;
                      })
                      .catch((err) => {
                        console.error(err);
                        const rejectResponse = {
                          status: "internal",
                          message:
                            "Attachment wasn't created. There is a problem with the database. Please try again later.",
                        };
                        reject(rejectResponse);
                        return;
                      });
                  })
                  .catch((err) => {
                    console.error(err);
                    const rejectResponse = {
                      status: "internal",
                      message:
                        "Attachment wasn't created. There is a problem with the database. Please try again later.",
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
