import * as admin from "firebase-admin";
import { getBoardSnap, isOwner } from "./dbUtils";
import { IAddViewerResponse } from "../dtos/responses";
import { IAddViewerRequest } from "../dtos/requests";

export const addViewerService = (
  request: IAddViewerRequest,
  userId: string
): Promise<IAddViewerResponse> => {
  return new Promise((resolve, reject) => {
    if (request.boardId === "" || request.boardId === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(rejectResponse);
      return;
    }

    if (request.userId === "" || request.userId === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "Viewer's id was empty or wasn't supplied.",
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

    const response: IAddViewerResponse = {
      boardId: request.boardId,
      userId: request.userId,
    };

    getBoardSnap(request.boardId, userId)
      .then((boardSnap) => {
        if (!isOwner(boardSnap, userId)) {
          const rejectResponse = {
            status: "permission-denied",
            message: "You don't have access to this board.",
          };
          reject(rejectResponse);
          return;
        }

        admin
          .auth()
          .getUser(request.userId)
          .then(() => {
            const batch = admin.firestore().batch();

            const newViewers = boardSnap.data().viewers;
            if (newViewers.indexOf(request.userId) !== -1) {
              // already a viewer
              resolve(response);
              return;
            }

            newViewers.push(request.userId);
            batch.update(boardSnap.ref, { viewers: newViewers });

            batch
              .commit()
              .then(() => {
                resolve(response);
                return;
              })
              .catch((err) => {
                console.error(err);
                const rejectResponse = {
                  status: "internal",
                  message:
                    "Viewer was not added. There is a problem with the database. Please try again later.",
                };
                reject(rejectResponse);
                return;
              });
          })
          .catch((err) => {
            if (err.code === "auth/user-not-found") {
              console.error(err);
              const rejectResponse = {
                status: "not-found",
                message:
                  "Viewer was not found. There is a problem with the database. Please try again later.",
              };
              reject(rejectResponse);
              return;
            } else {
              console.error(err);
              const rejectResponse = {
                status: "internal",
                message:
                  "Viewer was not added. There is a problem with the database. Please try again later.",
              };
              reject(rejectResponse);
              return;
            }
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
