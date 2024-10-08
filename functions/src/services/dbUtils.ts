import * as admin from "firebase-admin";
import { IUser } from "../dtos/IUser";
import { IAttachment } from "../dtos/IAttachment";
import { ICommentDb } from "../dtos/ICommentDb";
import { IComment } from "../dtos/IComment";
import UserRecord = admin.auth.UserRecord;
import { DocumentSnapshot } from "firebase-admin/firestore";

export const isOwner = (
  boardSnap: DocumentSnapshot,
  userId: string
): boolean => {
  return boardSnap.data().ownerId === userId;
};

export const isViewer = (
  boardSnap: DocumentSnapshot,
  userId: string
): boolean => {
  return boardSnap.data().viewers.indexOf(userId) !== -1;
};

export const getTaskSnap = (
  listSnap: DocumentSnapshot,
  taskId: string
): Promise<DocumentSnapshot> => {
  return new Promise((resolve, reject) => {
    if (taskId === "" || taskId === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "Task's id was empty or wasn't supplied.",
      };
      reject(rejectResponse);
      return;
    }

    const taskDoc = listSnap.ref.collection("tasks").doc(taskId);
    taskDoc
      .get()
      .then((taskDocSnap) => {
        if (taskDocSnap.exists) {
          resolve(taskDocSnap);
        } else {
          const rejectResponse = {
            status: "not-found",
            message: "Task with supplied id doesn't exist.",
          };
          reject(rejectResponse);
          return;
        }
      })
      .catch((err) => {
        console.error("getTaskSnap: " + err);
        const rejectResponse = {
          status: "internal",
          message:
            "There is a problem with the database. Please try again later.",
        };
        reject(rejectResponse);
        return;
      });
  });
};

export const getListSnap = (
  boardSnap: DocumentSnapshot,
  listId: string
): Promise<DocumentSnapshot> => {
  return new Promise((resolve, reject) => {
    if (listId === "" || listId === undefined) {
      const rejectResponse = {
        status: "invalid-argument",
        message: "List's id was empty or wasn't supplied.",
      };
      reject(rejectResponse);
      return;
    }

    const listDoc = boardSnap.ref.collection("lists").doc(listId);
    listDoc
      .get()
      .then((listDocSnap) => {
        if (listDocSnap.exists) {
          resolve(listDocSnap);
        } else {
          console.log(listId);
          const rejectResponse = {
            status: "not-found",
            message: "List with supplied id doesn't exist.",
          };
          reject(rejectResponse);
          return;
        }
      })
      .catch((err) => {
        console.error("getListSnap: " + err);
        const rejectResponse = {
          status: "internal",
          message:
            "There is a problem with the database. Please try again later.",
        };
        reject(rejectResponse);
        return;
      });
  });
};

export const getBoardSnap = (
  boardId: string,
  userId: string
): Promise<DocumentSnapshot> => {
  return new Promise((resolve, reject) => {
    if (boardId === "" || boardId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    if (userId === "" || userId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "User's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    const boardDoc = admin.firestore().collection("boards").doc(boardId);
    boardDoc
      .get()
      .then((boardDocSnap) => {
        if (boardDocSnap.exists) {
          resolve(boardDocSnap);
          return;
        } else {
          const errorResponse = {
            status: "not-found",
            message: "Board with supplied id doesn't exist.",
          };
          reject(errorResponse);
          return;
        }
      })
      .catch((err) => {
        console.error("getBoardSnap: " + err);
        const rejectResponse = {
          status: err.status,
          message: err.message,
        };
        reject(rejectResponse);
        return;
      });
  });
};

export const getPrevCurrentNextListSnaps = (
  boardSnap: DocumentSnapshot,
  listId: string
): Promise<{
  prev: DocumentSnapshot;
  curr: DocumentSnapshot;
  next: DocumentSnapshot;
}> => {
  return new Promise((resolve, reject) => {
    getListSnap(boardSnap, listId)
      .then((curr) => {
        const nextId = curr.data().nextListId;
        const prevId = curr.data().prevListId;

        getListSnap(boardSnap, prevId)
          .then((prev) => {
            getListSnap(boardSnap, nextId)
              .then((next) => {
                resolve({ prev, curr, next });
                return;
              })
              .catch((nextErr) => {
                console.log("nextListId: " + nextId);
                console.log("nextListError: " + nextErr);
                resolve({ prev, curr, next: null });
                return;
              });
          })
          .catch((prevErr) => {
            console.log("prevListId: " + prevId);
            console.log("prevListError: " + prevErr);
            getListSnap(boardSnap, nextId)
              .then((next) => {
                resolve({ prev: null, curr, next });
                return;
              })
              .catch((nextErr) => {
                console.error("nextListId: " + nextId);
                console.error("nextListError: " + nextErr);
                resolve({ prev: null, curr, next: null });
                return;
              });
            return;
          });
      })
      .catch((err) => {
        console.error("nextListId: " + listId);
        console.error("nextListError: " + err);
        const rejectResponse = {
          status: err.status,
          message: err.message,
        };
        reject(rejectResponse);
        return;
      });
  });
};

export const getTwoListSnaps = (
  boardSnap: DocumentSnapshot,
  firstListId: string,
  secondListId: string
): Promise<{ first: DocumentSnapshot; second: DocumentSnapshot }> => {
  return new Promise((resolve) => {
    getListSnap(boardSnap, firstListId)
      .then((first) => {
        getListSnap(boardSnap, secondListId)
          .then((second) => {
            resolve({ first, second });
            return;
          })
          .catch((secondErr) => {
            console.log("listId: " + secondListId);
            console.log("listIdError: " + secondErr);
            resolve({ first, second: null });
            return;
          });
      })
      .catch((firstErr) => {
        getListSnap(boardSnap, secondListId)
          .then((second) => {
            resolve({ first: null, second });
            return;
          })
          .catch((secondErr) => {
            console.log("listId: " + secondListId);
            console.log("listIdError: " + secondErr);
            resolve({ first: null, second: null });
            return;
          });
        console.error("listId: " + firstListId);
        console.error("listIdError: " + firstErr);
      });
  });
};

export const getPrevCurrentNextTaskSnaps = (
  listSnap: DocumentSnapshot,
  taskId: string
): Promise<{
  prev: DocumentSnapshot;
  curr: DocumentSnapshot;
  next: DocumentSnapshot;
}> => {
  return new Promise((resolve, reject) => {
    getTaskSnap(listSnap, taskId)
      .then((curr) => {
        const nextTaskId = curr.data().nextTaskId;
        const prevTaskId = curr.data().prevTaskId;

        getTaskSnap(listSnap, prevTaskId)
          .then((prev) => {
            getTaskSnap(listSnap, nextTaskId)
              .then((next) => {
                resolve({ prev, curr, next });
                return;
              })
              .catch((nextErr) => {
                console.log("nextTaskId: " + nextTaskId);
                console.log("nextTaskIdError: " + nextErr);
                resolve({ prev, curr, next: null });
                return;
              });
          })
          .catch((prevErr) => {
            console.log("prevTaskId: " + prevTaskId);
            console.log("prevTaskIdError: " + prevErr);
            getTaskSnap(listSnap, nextTaskId)
              .then((next) => {
                resolve({ prev: null, curr, next });
                return;
              })
              .catch((nextErr) => {
                console.log("nextTaskId: " + nextTaskId);
                console.log("nextTaskIdError: " + nextErr);
                resolve({ prev: null, curr, next: null });
                return;
              });
            return;
          });
      })
      .catch((err) => {
        console.log("currentTaskId: " + taskId);
        console.log("currentTaskIdError: " + err);
        const rejectResponse = {
          status: err.status,
          message: err.message,
        };
        reject(rejectResponse);
        return;
      });
  });
};

export const getTwoTaskSnaps = (
  listSnap: DocumentSnapshot,
  firstTaskId: string,
  secondTaskId: string
): Promise<{ first: DocumentSnapshot; second: DocumentSnapshot }> => {
  return new Promise((resolve) => {
    getTaskSnap(listSnap, firstTaskId)
      .then((first) => {
        getTaskSnap(listSnap, secondTaskId)
          .then((second) => {
            resolve({ first, second });
            return;
          })
          .catch((secondErr) => {
            console.log("taskId: " + secondTaskId);
            console.log("taskIdError: " + secondErr);
            resolve({ first, second: null });
            return;
          });
      })
      .catch((firstErr) => {
        getTaskSnap(listSnap, secondTaskId)
          .then((second) => {
            resolve({ first: null, second });
            return;
          })
          .catch((secondErr) => {
            console.log("taskId: " + secondTaskId);
            console.log("taskIdError: " + secondErr);
            resolve({ first: null, second: null });
            return;
          });
        console.error("taskId: " + firstTaskId);
        console.error("taskIdError: " + firstErr);
      });
  });
};

export const getViewers = (userIds: string[]): Promise<IUser[]> => {
  return new Promise((resolve) => {
    const getUserPromises: Promise<UserRecord>[] = [];

    userIds.forEach((userId) =>
      getUserPromises.push(admin.auth().getUser(userId))
    );

    Promise.all(getUserPromises)
      .then((users: UserRecord[]) => {
        const iusers = users.map((user: UserRecord) => {
          return {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            email: user.email,
          };
        });
        resolve(iusers);
        return;
      })
      .catch((err) => {
        console.error(err);
        resolve([]);
        return;
      });
  });
};

export const getAttachmentsToDisplay = (
  boardId: string
): Promise<IAttachment[]> => {
  return new Promise((resolve, reject) => {
    if (boardId === "" || boardId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    admin
      .firestore()
      .collection("attachments")
      .get()
      .then((querySnap) => {
        resolve(
          querySnap.docs
            .filter(
              (doc) => doc.data().boardId === boardId && doc.data().url !== ""
            )
            .map((attachmentDoc) => {
              const attachmentData = attachmentDoc.data();
              const attachmentId = attachmentDoc.id;
              return {
                id: attachmentId,
                boardId: boardId,
                listId: attachmentData.listId,
                taskId: attachmentData.taskId,
                name: attachmentData.name,
                url: attachmentData.url,
              };
            })
        );
      })
      .catch((err) => {
        console.error(err);
        reject(err);
        return;
      });
  });
};

export const getCommentsToDisplay = (boardId: string): Promise<IComment[]> => {
  return new Promise((resolve, reject) => {
    if (boardId === "" || boardId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    admin
      .firestore()
      .collection("comments")
      .get()
      .then((querySnap) => {
        const authors: Promise<UserRecord>[] = [];

        const icommentsDb: ICommentDb[] = querySnap.docs
          .filter((doc) => doc.data().boardId === boardId)
          .map((commentDoc) => {
            const commentData = commentDoc.data();
            authors.push(admin.auth().getUser(commentData.authorId));
            return {
              id: commentDoc.id,
              authorId: commentData.authorId,
              content: commentData.content,
              timestamp: commentData.timestamp,
              boardId: commentData.boardId,
              listId: commentData.listId,
              taskId: commentData.taskId,
            };
          });

        Promise.all(authors)
          .then((authorsData) => {
            resolve(
              icommentsDb.map((commentDb) => {
                const firebaseAuthor = authorsData.find(
                  (authorData) => authorData.uid === commentDb.authorId
                );

                const author: IUser = {
                  uid: firebaseAuthor.uid,
                  email: firebaseAuthor.email,
                  photoURL: firebaseAuthor.photoURL,
                  displayName: firebaseAuthor.displayName,
                };

                return {
                  id: commentDb.id,
                  author: author,
                  content: commentDb.content,
                  timestamp: commentDb.timestamp,
                  boardId: commentDb.boardId,
                  listId: commentDb.listId,
                  taskId: commentDb.taskId,
                };
              })
            );
            return;
          })
          .catch((err) => {
            console.error(err);
            reject(err);
            return;
          });
      })
      .catch((err) => {
        console.error(err);
        reject(err);
        return;
      });
  });
};

export const getAttachmentDocsForTask = (
  boardId: string,
  listId: string,
  taskId: string
): Promise<DocumentSnapshot[]> => {
  return new Promise((resolve, reject) => {
    if (boardId === "" || boardId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    if (listId === "" || listId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "List's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    if (taskId === "" || taskId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Task's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    admin
      .firestore()
      .collection("attachments")
      .get()
      .then((querySnap) => {
        resolve(
          querySnap.docs.filter((doc) => {
            const docData = doc.data();
            return (
              docData.boardId === boardId &&
              docData.listId === listId &&
              docData.taskId === taskId
            );
          })
        );
      })
      .catch((err) => {
        console.error(err);
        reject(err);
        return;
      });
  });
};

export const getAttachmentSnap = (
  boardId: string,
  listId: string,
  taskId: string,
  attachmentId: string
): Promise<DocumentSnapshot> => {
  return new Promise((resolve, reject) => {
    if (boardId === "" || boardId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    if (listId === "" || listId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "List's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    if (taskId === "" || taskId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Task's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    if (attachmentId === "" || attachmentId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Attachment's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    admin
      .firestore()
      .collection("attachments")
      .doc(attachmentId)
      .get()
      .then((attachmentSnap) => {
        if (
          attachmentSnap.data().boardId === boardId &&
          attachmentSnap.data().listId === listId &&
          attachmentSnap.data().taskId === taskId
        ) {
          resolve(attachmentSnap);
          return;
        } else {
          const errorResponse = {
            status: "invalid-argument",
            message: "Attachment with supplied data doesn't exist.",
          };
          reject(errorResponse);
          return;
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
        return;
      });
  });
};

export const getAttachmentDocsForBoard = (
  boardId: string
): Promise<DocumentSnapshot[]> => {
  return new Promise((resolve, reject) => {
    if (boardId === "" || boardId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    admin
      .firestore()
      .collection("attachments")
      .get()
      .then((querySnap) => {
        resolve(
          querySnap.docs.filter((doc) => {
            const docData = doc.data();
            return docData.boardId === boardId;
          })
        );
      })
      .catch((err) => {
        console.error(err);
        reject(err);
        return;
      });
  });
};

export const getAttachmentDocsForList = (
  boardId: string,
  listId: string
): Promise<DocumentSnapshot[]> => {
  return new Promise((resolve, reject) => {
    if (boardId === "" || boardId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    if (listId === "" || listId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "List's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    admin
      .firestore()
      .collection("attachments")
      .get()
      .then((querySnap) => {
        resolve(
          querySnap.docs.filter((doc) => {
            const docData = doc.data();
            return docData.boardId === boardId && docData.listId === listId;
          })
        );
      })
      .catch((err) => {
        console.error(err);
        reject(err);
        return;
      });
  });
};

export const getCommentDocsForTask = (
  boardId: string,
  listId: string,
  taskId: string
): Promise<DocumentSnapshot[]> => {
  return new Promise((resolve, reject) => {
    if (boardId === "" || boardId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    if (listId === "" || listId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "List's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    if (taskId === "" || taskId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Task's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    admin
      .firestore()
      .collection("comments")
      .get()
      .then((querySnap) => {
        resolve(
          querySnap.docs.filter((doc) => {
            const docData = doc.data();
            return (
              docData.boardId === boardId &&
              docData.listId === listId &&
              docData.taskId === taskId
            );
          })
        );
      })
      .catch((err) => {
        console.error(err);
        reject(err);
        return;
      });
  });
};

export const getCommentSnap = (
  boardId: string,
  listId: string,
  taskId: string,
  attachmentId: string
): Promise<DocumentSnapshot> => {
  return new Promise((resolve, reject) => {
    if (boardId === "" || boardId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    if (listId === "" || listId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "List's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    if (taskId === "" || taskId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Task's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    if (attachmentId === "" || attachmentId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Comment's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    admin
      .firestore()
      .collection("comments")
      .doc(attachmentId)
      .get()
      .then((attachmentSnap) => {
        if (
          attachmentSnap.data().boardId === boardId &&
          attachmentSnap.data().listId === listId &&
          attachmentSnap.data().taskId === taskId
        ) {
          resolve(attachmentSnap);
          return;
        } else {
          const errorResponse = {
            status: "invalid-argument",
            message: "Comment with supplied data doesn't exist.",
          };
          reject(errorResponse);
          return;
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
        return;
      });
  });
};

export const getCommentDocsForBoard = (
  boardId: string
): Promise<DocumentSnapshot[]> => {
  return new Promise((resolve, reject) => {
    if (boardId === "" || boardId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    admin
      .firestore()
      .collection("comments")
      .get()
      .then((querySnap) => {
        resolve(
          querySnap.docs.filter((doc) => {
            const docData = doc.data();
            return docData.boardId === boardId;
          })
        );
      })
      .catch((err) => {
        console.error(err);
        reject(err);
        return;
      });
  });
};

export const getCommentDocsForList = (
  boardId: string,
  listId: string
): Promise<DocumentSnapshot[]> => {
  return new Promise((resolve, reject) => {
    if (boardId === "" || boardId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "Board's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    if (listId === "" || listId === undefined) {
      const errorResponse = {
        status: "invalid-argument",
        message: "List's id was empty or wasn't supplied.",
      };
      reject(errorResponse);
      return;
    }

    admin
      .firestore()
      .collection("comments")
      .get()
      .then((querySnap) => {
        resolve(
          querySnap.docs.filter((doc) => {
            const docData = doc.data();
            return docData.boardId === boardId && docData.listId === listId;
          })
        );
      })
      .catch((err) => {
        console.error(err);
        reject(err);
        return;
      });
  });
};
