import * as admin from "firebase-admin";
import { IBoardMiniature } from "../dtos/IBoardMiniature";
import { isOwner, isViewer } from "./dbUtils";
import { IGetBoardMiniaturesResponse } from "../dtos/responses";

export const getBoardMiniaturesService = (
  userId: string
): Promise<IGetBoardMiniaturesResponse> => {
  return new Promise((resolve, reject) => {
    if (userId === "" || userId === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "User's id was empty or wasn't supplied.",
      };
      reject(rejectResponse);
      return;
    }

    const boardsCollection = admin.firestore().collection("boards");
    boardsCollection
      .get()
      .then((querySnapshot) => {
        const boardMiniatures = [];
        querySnapshot.forEach((doc) => {
          const isOwnedBoard = isOwner(doc, userId);

          if (isOwnedBoard || isViewer(doc, userId)) {
            const boardMiniature: IBoardMiniature = {
              id: doc.id,
              name: doc.data().name,
              owner: isOwnedBoard,
            };

            boardMiniatures.push(boardMiniature);
          }
        });

        const response: IGetBoardMiniaturesResponse = {
          boardMiniatures: boardMiniatures,
        };

        resolve(response);
        return;
      })
      .catch((err) => {
        console.error(err);
        const rejectResponse = {
          status: "internal",
          message:
            "Board miniatures were not fetched. There is a problem with the database. Please try again later.",
        };
        reject(rejectResponse);
        return;
      });
  });
};
