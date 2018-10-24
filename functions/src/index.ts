import * as functions from "firebase-functions";
import { getGravatarUrlService } from "./services/getGravatarUrl";
import * as admin from "firebase-admin";
import { getBoardMiniaturesService } from "./services/getBoardMiniatures";
import { getBoardService } from "./services/getBoard";
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


