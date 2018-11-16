import {getCommentDocsForBoard, getCommentDocsForList, getCommentDocsForTask} from "./dbUtils";

export const deleteCommentsForTask = (boardId: string, listId: string, taskId: string): void => {
    getCommentDocsForTask(boardId, listId, taskId).then((commentDocs) => {
        commentDocs.forEach((doc) => doc.ref.delete());
    }).catch((err) => {
        console.error(err);
    });
};

export const deleteCommentsForBoard = (boardId: string): void => {
    getCommentDocsForBoard(boardId).then((commentDocs) => {
        commentDocs.forEach((doc) => doc.ref.delete());
    }).catch((err) => {
        console.error(err);
    });
};

export const deleteCommentsForList = (boardId: string, listId: string): void => {
    getCommentDocsForList(boardId, listId).then((commentDocs) => {
        commentDocs.forEach((doc) => doc.ref.delete());
    }).catch((err) => {
        console.error(err);
    });
};