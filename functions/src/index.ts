import * as functions from "firebase-functions";
import { getGravatarUrlService } from "./services/getGravatarUrl";
import * as admin from "firebase-admin";
import { getBoardMiniaturesService } from "./services/getBoardMiniatures";
import { getBoardService } from "./services/getBoard";
import { setBoardNameService } from "./services/setBoardName";
admin.initializeApp();

export const getBoardMiniatures = functions.https.onCall(({ userId }: { userId: string }) => {
  return getBoardMiniaturesService(userId);
});

export const getBoard = functions.https.onCall(({ boardId, userId }: { boardId: string, userId: string }) => {
  return getBoardService(boardId, userId);
});

export const getGravatarUrl = functions.https.onCall(({ email }: { email: string }) => {
  return getGravatarUrlService(email);
});

export const setBoardName = functions.https.onCall(({ boardId, boardName, userId }: { boardId: string, boardName: string, userId: string }) => {
  return setBoardNameService(boardId, boardName, userId);
});


