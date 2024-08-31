import {
  getAttachmentDocsForBoard,
  getAttachmentDocsForList,
  getAttachmentDocsForTask,
} from "./dbUtils";

export const deleteAttachmentsForTask = (
  boardId: string,
  listId: string,
  taskId: string
): void => {
  getAttachmentDocsForTask(boardId, listId, taskId)
    .then((attachmentDocs) => {
      attachmentDocs.forEach((doc) => doc.ref.delete());
    })
    .catch((err) => {
      console.error(err);
    });
};

export const deleteAttachmentsForBoard = (boardId: string): void => {
  getAttachmentDocsForBoard(boardId)
    .then((attachmentDocs) => {
      attachmentDocs.forEach((doc) => doc.ref.delete());
    })
    .catch((err) => {
      console.error(err);
    });
};

export const deleteAttachmentsForList = (
  boardId: string,
  listId: string
): void => {
  getAttachmentDocsForList(boardId, listId)
    .then((attachmentDocs) => {
      attachmentDocs.forEach((doc) => doc.ref.delete());
    })
    .catch((err) => {
      console.error(err);
    });
};
