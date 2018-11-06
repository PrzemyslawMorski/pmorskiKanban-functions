import * as functions from "firebase-functions";
import { getGravatarUrlService } from "./services/getGravatarUrl";
import * as admin from "firebase-admin";
import { getBoardMiniaturesService } from "./services/getBoardMiniatures";
import { getBoardService } from "./services/getBoard";
import { renameBoardService } from "./services/renameBoard";
import { createBoardService } from "./services/createBoard";
import { CallableContext, HttpsError } from "firebase-functions/lib/providers/https";
import { deleteBoardService } from "./services/deleteBoard";
import { createListService } from "./services/createList";
import { deleteListService } from "./services/deleteList";
import { renameListService } from "./services/renameList";
import { createTaskService } from "./services/createTask";
import { deleteTaskService } from "./services/deleteTask";
import {
  IGetBoardRequest, IGetGravatarUrlRequest, IRenameBoardRequest,
  ICreateBoardRequest, IDeleteBoardRequest, ICreateListRequest, IDeleteListRequest, IRenameListRequest,
  ICreateTaskRequest, IDeleteTaskRequest
} from "./dtos/requests";

admin.initializeApp();

const firestore = admin.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true };
firestore.settings(settings);


export const getBoardMiniatures = functions.https.onCall((context: CallableContext) => {
  return getBoardMiniaturesService(context.auth.uid).then(response => {
    return response;
  }).catch((err) => {
    console.log('catch in index.ts')
    console.log('errstatus: ' + err.status);
    console.log('errmessage: ' + err.message);
    throw new functions.https.HttpsError(err.status, err.message);
  });
});

// export const getBoardMiniaturesTest = functions.https.onCall((data: { userId: string }) => {
//   return getBoardMiniaturesService(data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts')
//     console.log('errstatus: ' + err.status);
//     console.log('errmessage: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const getBoard = functions.https.onCall((data: IGetBoardRequest, context: CallableContext) => {
  return getBoardService(data.boardId, context.auth.uid).then(response => {
    return response;
  }).catch((err) => {
    console.log('catch in index.ts')
    console.log('errstatus: ' + err.status);
    console.log('errmessage: ' + err.message);
    throw new functions.https.HttpsError(err.status, err.message);
  });
});

// export const getBoardTest = functions.https.onCall((data: IGetBoardRequest & { userId: string }) => {
//   return getBoardService(data.boardId, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts')
//     console.log('errstatus: ' + err.status);
//     console.log('errmessage: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const getGravatarUrl = functions.https.onCall((data: IGetGravatarUrlRequest) => {
  return getGravatarUrlService(data.email);
});

export const renameBoard = functions.https.onCall((data: IRenameBoardRequest, context: CallableContext) => {
  return renameBoardService(data.boardId, data.boardName, context.auth.uid).then(response => {
    return response;
  }).catch((err) => {
    console.log('catch in index.ts')
    console.log('errstatus: ' + err.status);
    console.log('errmessage: ' + err.message);
    throw new functions.https.HttpsError(err.status, err.message);
  });
});

// export const renameBoardTest = functions.https.onCall((data: IRenameBoardRequest & { userId: string }) => {
//   return renameBoardService(data.boardId, data.boardName, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts')
//     console.log('errstatus: ' + err.status);
//     console.log('errmessage: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const createBoard = functions.https.onCall((data: ICreateBoardRequest, context: CallableContext) => {
  return createBoardService(data.boardName, context.auth.uid).then(response => {
    return response;
  }).catch((err) => {
    console.log('catch in index.ts')
    console.log('errstatus: ' + err.status);
    console.log('errmessage: ' + err.message);
    throw new functions.https.HttpsError(err.status, err.message);
  });
});

// export const createBoardTest = functions.https.onCall((data: ICreateBoardRequest & { userId: string }) => {
//   return createBoardService(data.boardName, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts')
//     console.log('errstatus: ' + err.status);
//     console.log('errmessage: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const deleteBoard = functions.https.onCall((data: IDeleteBoardRequest, context: CallableContext) => {
  return deleteBoardService(data.boardId, context.auth.uid).then(response => {
    return response;
  }).catch((err) => {
    console.log('catch in index.ts')
    console.log('errstatus: ' + err.status);
    console.log('errmessage: ' + err.message);
    throw new functions.https.HttpsError(err.status, err.message);
  });
});

// export const deleteBoardTest = functions.https.onCall((data: IDeleteBoardRequest & { userId: string }) => {
//   return deleteBoardService(data.boardId, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts')
//     console.log('errstatus: ' + err.status);
//     console.log('errmessage: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const createList = functions.https.onCall((data: ICreateListRequest, context: CallableContext) => {
  return createListService(data.boardId, data.listName, context.auth.uid).then(response => {
    return response;
  }).catch((err) => {
    console.log('catch in index.ts')
    console.log('errstatus: ' + err.status);
    console.log('errmessage: ' + err.message);
    throw new functions.https.HttpsError(err.status, err.message);
  });
});

// export const createListTest = functions.https.onCall((data: ICreateListRequest & { userId: string }) => {
//   return createListService(data.boardId, data.listName, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts')
//     console.log('errstatus: ' + err.status);
//     console.log('errmessage: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const deleteList = functions.https.onCall((data: IDeleteListRequest, context: CallableContext) => {
  return deleteListService(data.boardId, data.listId, context.auth.uid).then(response => {
    return response;
  }).catch((err) => {
    console.log('catch in index.ts')
    console.log('errstatus: ' + err.status);
    console.log('errmessage: ' + err.message);
    throw new functions.https.HttpsError(err.status, err.message);
  });
});

// export const deleteListTest = functions.https.onCall((data: IDeleteListRequest & { userId: string }) => {
//   return deleteListService(data.boardId, data.listId, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts')
//     console.log('errstatus: ' + err.status);
//     console.log('errmessage: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const renameList = functions.https.onCall((data: IRenameListRequest, context: CallableContext) => {
  return renameListService(data.boardId, data.listId, data.listName, context.auth.uid).then(response => {
    return response;
  }).catch((err) => {
    console.log('catch in index.ts')
    console.log('errstatus: ' + err.status);
    console.log('errmessage: ' + err.message);
    throw new functions.https.HttpsError(err.status, err.message);
  });
});

// export const renameListTest = functions.https.onCall((data: IRenameListRequest & { userId: string }) => {
//   return renameListService(data.boardId, data.listId, data.listName, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts')
//     console.log('errstatus: ' + err.status);
//     console.log('errmessage: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const createTask = functions.https.onCall((data: ICreateTaskRequest, context: CallableContext) => {
  return createTaskService(data.boardId, data.listId, data.taskName, context.auth.uid).then(response => {
    return response;
  }).catch((err) => {
    console.log('catch in index.ts')
    console.log('errstatus: ' + err.status);
    console.log('errmessage: ' + err.message);
    throw new functions.https.HttpsError(err.status, err.message);
  });
});

// export const createTaskTest = functions.https.onCall((data: ICreateTaskRequest & { userId: string }) => {
//   return createTaskService(data.boardId, data.listId, data.taskName, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts')
//     console.log('errstatus: ' + err.status);
//     console.log('errmessage: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const deleteTask = functions.https.onCall((data: IDeleteTaskRequest, context: CallableContext) => {
  return deleteTaskService(data.boardId, data.listId, data.taskId, context.auth.uid).then(response => {
    return response;
  }).catch((err) => {
    console.log('catch in index.ts')
    console.log('errstatus: ' + err.status);
    console.log('errmessage: ' + err.message);
    throw new functions.https.HttpsError(err.status, err.message);
  });
});

// export const deleteTaskTest = functions.https.onCall((data: IDeleteTaskRequest & { userId: string }) => {
//   return deleteTaskService(data.boardId, data.listId, data.taskId, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts')
//     console.log('errstatus: ' + err.status);
//     console.log('errmessage: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });