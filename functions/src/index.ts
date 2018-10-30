import * as functions from "firebase-functions";
import { getGravatarUrlService } from "./services/getGravatarUrl";
import * as admin from "firebase-admin";
import { getBoardMiniaturesService } from "./services/getBoardMiniatures";
import { getBoardService } from "./services/getBoard";
import { setBoardNameService } from "./services/setBoardName";
import { createBoardService } from "./services/createBoard";
import { CallableContext } from "firebase-functions/lib/providers/https";

admin.initializeApp();

export const getBoardMiniatures = functions.https.onCall((data: any, context: CallableContext) => {
  return getBoardMiniaturesService(context.auth.uid);
});

export const getBoard = functions.https.onCall((data: { boardId: string }, context: CallableContext) => {
  return getBoardService(data.boardId, context.auth.uid);
});

export const getGravatarUrl = functions.https.onCall((data: { email: string }) => {
  return getGravatarUrlService(data.email);
});

export const setBoardName = functions.https.onCall((data: { boardId: string, boardName: string, userId: string }, context: CallableContext) => {
  return setBoardNameService(data.boardId, data.boardName, context.auth.uid);
});

export const createBoard = functions.https.onCall((data: { boardName: string, userId: string }, context: CallableContext) => {
  return createBoardService(data.boardName, context.auth.uid);
});


