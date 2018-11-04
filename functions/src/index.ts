import * as functions from "firebase-functions";
import { getGravatarUrlService } from "./services/getGravatarUrl";
import * as admin from "firebase-admin";
import { getBoardMiniaturesService } from "./services/getBoardMiniatures";
import { getBoardService } from "./services/getBoard";
import { setBoardNameService } from "./services/setBoardName";
import { createBoardService } from "./services/createBoard";
import { CallableContext } from "firebase-functions/lib/providers/https";
import { deleteBoardService } from "./services/deleteBoard";
import { createListService } from "./services/createList";
import { deleteListService } from "./services/deleteList";
import { renameListService } from "./services/renameList";
import { createTaskService } from "./services/createTask";
import { deleteTaskService } from "./services/deleteTask";

admin.initializeApp();

const firestore = admin.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true };
firestore.settings(settings);


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

export const deleteBoard = functions.https.onCall((data: { boardId: string }, context: CallableContext) => {
  return deleteBoardService(data.boardId, context.auth.uid);
});

export const createList = functions.https.onCall((data: { boardId: string, listName: string }, context: CallableContext) => {
  return createListService(data.boardId, data.listName, context.auth.uid);
});

export const deleteList = functions.https.onCall((data: { boardId: string, listId: string }, context: CallableContext) => {
  return deleteListService(data.boardId, data.listId, context.auth.uid);
})

export const renameList = functions.https.onCall((data: { boardId: string, listId: string, listName: string }, context: CallableContext) => {
  return renameListService(data.boardId, data.listId, data.listName, context.auth.uid);
})

export const createTask = functions.https.onCall((data: { boardId: string, listId: string, taskName: string }, context: CallableContext) => {
  return createTaskService(data.boardId, data.listId, data.taskName, context.auth.uid);
});

// export const createTaskTest = functions.https.onCall((data: { boardId: string, listId: string, taskName: string, ownerId: string }) => {
//   return createTaskService(data.boardId, data.listId, data.taskName, data.ownerId);
// });

export const deleteTask = functions.https.onCall((data: { boardId: string, listId: string, taskId: string }, context: CallableContext) => {
  return deleteTaskService(data.boardId, data.listId, data.taskId, context.auth.uid);
})

// export const deleteTaskTest = functions.https.onCall((data: { boardId: string, listId: string, taskId: string, ownerId: string }) => {
//   return deleteTaskService(data.boardId, data.listId, data.taskId, data.ownerId);
// })