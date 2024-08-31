import * as admin from "firebase-admin";
import { getBoardSnap, isViewer } from "./dbUtils";
import { IUnsubBoardResponse } from "../dtos/responses";
import { IUnsubBoardRequest } from "../dtos/requests";

export const unsubBoardService = (
  request: IUnsubBoardRequest,
  userId: string
): Promise<IUnsubBoardResponse> => {
  return new Promise((resolve, reject) => {
    if (request.boardId === "" || request.boardId === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
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

    const response: IUnsubBoardResponse = {
      boardId: request.boardId,
      userId: userId,
    };

    getBoardSnap(request.boardId, userId)
      .then((boardSnap) => {
        if (!isViewer(boardSnap, userId)) {
          const rejectResponse = {
            status: "permission-denied",
            message: "You don't have access to this board.",
          };
          reject(rejectResponse);
          return;
        }

        const batch = admin.firestore().batch();

        const newViewers = boardSnap.data().viewers;
        const indexOfDeletedViewer = newViewers.indexOf(userId);
        if (indexOfDeletedViewer === -1) {
          // already removed the viewer
          resolve(response);
          return;
        }

        newViewers.splice(indexOfDeletedViewer, 1);
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
                "Board was not unsubbed. There is a problem with the database. Please try again later.",
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
