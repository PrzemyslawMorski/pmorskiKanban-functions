import * as functions from "firebase-functions";
import {getGravatarUrlService} from "./services/getGravatarUrl";
import * as admin from "firebase-admin";
import {getBoardMiniaturesService} from "./services/getBoardMiniatures";
import {getBoardService} from "./services/getBoard";
import {renameBoardService} from "./services/renameBoard";
import {createBoardService} from "./services/createBoard";
import {CallableContext} from "firebase-functions/lib/providers/https";
import {deleteBoardService} from "./services/deleteBoard";
import {createListService} from "./services/createList";
import {deleteListService} from "./services/deleteList";
import {renameListService} from "./services/renameList";
import {createTaskService} from "./services/createTask";
import {deleteTaskService} from "./services/deleteTask";
import {
    IAddAttachmentRequest,
    IAddViewerRequest,
    IChangeTaskDescriptionRequest,
    ICreateBoardRequest,
    ICreateListRequest,
    ICreateTaskRequest,
    IDeleteBoardRequest,
    IDeleteListRequest,
    IDeleteTaskRequest,
    IGetBoardRequest,
    IGetGravatarUrlRequest,
    IMoveListRequest,
    IMoveTaskRequest,
    IRemoveAttachmentRequest,
    IRemoveViewerRequest,
    IRenameBoardRequest,
    IRenameListRequest,
    IRenameTaskRequest,
    ISearchUsersRequest,
    ISetAttachmentUrlRequest,
    IUnsubBoardRequest
} from "./dtos/requests";
import {renameTaskService} from "./services/renameTask";
import {changeTaskDescriptionService} from "./services/changeTaskDescription";
import {moveListService} from "./services/moveList";
import {moveTaskService} from "./services/moveTask";
import {addViewerService} from "./services/addViewer";
import {removeViewerService} from "./services/removeViewer";
import {unsubBoardService} from "./services/unsubBoard";
import {searchUsersByEmailService} from "./services/searchUsersByEmail";
import {onAttachmentDeletedService} from "./services/onAttachmentDeleted";
import {addAttachmentService, setAttachmentUrlService} from "./services/addAttachment";
import {removeAttachmentService} from "./services/removeAttachment";

const serviceAccount = require("./pmorskikanban-firebase-adminsdk");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pmorskikanban.firebaseio.com",
    storageBucket: "pmorskikanban.appspot.com",
});

const firestore = admin.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);

export const getBoardMiniatures = functions.https.onCall((data: any, context: CallableContext) => {
    return getBoardMiniaturesService(context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const getBoardMiniaturesTest = functions.https.onCall((data: { userId: string }) => {
//   return getBoardMiniaturesService(data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts');
//     console.log('error status: ' + err.status);
//     console.log('error message: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const getBoard = functions.https.onCall((data: IGetBoardRequest, context: CallableContext) => {
    return getBoardService(data.boardId, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const getBoardTest = functions.https.onCall((data: IGetBoardRequest & { userId: string }) => {
//   return getBoardService(data.boardId, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts');
//     console.log('error status: ' + err.status);
//     console.log('error message: ' + err.message);
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
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const renameBoardTest = functions.https.onCall((data: IRenameBoardRequest & { userId: string }) => {
//   return renameBoardService(data.boardId, data.boardName, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts');
//     console.log('error status: ' + err.status);
//     console.log('error message: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const createBoard = functions.https.onCall((data: ICreateBoardRequest, context: CallableContext) => {
    return createBoardService(data.boardName, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const createBoardTest = functions.https.onCall((data: ICreateBoardRequest & { userId: string }) => {
//   return createBoardService(data.boardName, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts');
//     console.log('error status: ' + err.status);
//     console.log('error message: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const deleteBoard = functions.https.onCall((data: IDeleteBoardRequest, context: CallableContext) => {
    return deleteBoardService(data.boardId, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const deleteBoardTest = functions.https.onCall((data: IDeleteBoardRequest & { userId: string }) => {
//   return deleteBoardService(data.boardId, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts');
//     console.log('error status: ' + err.status);
//     console.log('error message: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const createList = functions.https.onCall((data: ICreateListRequest, context: CallableContext) => {
    return createListService(data.boardId, data.listName, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const createListTest = functions.https.onCall((data: ICreateListRequest & { userId: string }) => {
//   return createListService(data.boardId, data.listName, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts');
//     console.log('error status: ' + err.status);
//     console.log('error message: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const deleteList = functions.https.onCall((data: IDeleteListRequest, context: CallableContext) => {
    return deleteListService(data.boardId, data.listId, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const deleteListTest = functions.https.onCall((data: IDeleteListRequest & { userId: string }) => {
//   return deleteListService(data.boardId, data.listId, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts');
//     console.log('error status: ' + err.status);
//     console.log('error message: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const renameList = functions.https.onCall((data: IRenameListRequest, context: CallableContext) => {
    return renameListService(data.boardId, data.listId, data.listName, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const renameListTest = functions.https.onCall((data: IRenameListRequest & { userId: string }) => {
//   return renameListService(data.boardId, data.listId, data.listName, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts');
//     console.log('error status: ' + err.status);
//     console.log('error message: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const createTask = functions.https.onCall((data: ICreateTaskRequest, context: CallableContext) => {
    return createTaskService(data.boardId, data.listId, data.taskName, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const createTaskTest = functions.https.onCall((data: ICreateTaskRequest & { userId: string }) => {
//   return createTaskService(data.boardId, data.listId, data.taskName, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts');
//     console.log('error status: ' + err.status);
//     console.log('error message: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const deleteTask = functions.https.onCall((data: IDeleteTaskRequest, context: CallableContext) => {
    return deleteTaskService(data.boardId, data.listId, data.taskId, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const deleteTaskTest = functions.https.onCall((data: IDeleteTaskRequest & { userId: string }) => {
//   return deleteTaskService(data.boardId, data.listId, data.taskId, data.userId).then(response => {
//     return response;
//   }).catch((err) => {
//     console.log('catch in index.ts');
//     console.log('error status: ' + err.status);
//     console.log('error message: ' + err.message);
//     throw new functions.https.HttpsError(err.status, err.message);
//   });
// });

export const renameTask = functions.https.onCall((data: IRenameTaskRequest, context: CallableContext) => {
    return renameTaskService(data.boardId, data.listId, data.taskId, data.newTaskName, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const renameTaskTest = functions.https.onCall((data: IRenameTaskRequest & { userId: string }) => {
//     return renameTaskService(data.boardId, data.listId, data.taskId, data.newTaskName, data.userId).then(response => {
//         return response;
//     }).catch((err) => {
//         console.log('catch in index.ts');
//         console.log('error status: ' + err.status);
//         console.log('error message: ' + err.message);
//         throw new functions.https.HttpsError(err.status, err.message);
//     });
// });

export const changeTaskDescription = functions.https.onCall((data: IChangeTaskDescriptionRequest, context: CallableContext) => {
    return changeTaskDescriptionService(data.boardId, data.listId, data.taskId, data.newTaskDescription, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const changeTaskDescriptionTest = functions.https.onCall((data: IChangeTaskDescriptionRequest & { userId: string }) => {
//     return changeTaskDescriptionService(data.boardId, data.listId, data.taskId, data.newTaskDescription, data.userId).then(response => {
//         return response;
//     }).catch((err) => {
//         console.log('catch in index.ts');
//         console.log('error status: ' + err.status);
//         console.log('error message: ' + err.message);
//         throw new functions.https.HttpsError(err.status, err.message);
//     });
// });

export const moveList = functions.https.onCall((data: IMoveListRequest, context: CallableContext) => {
    return moveListService(data, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const moveListTest = functions.https.onCall((data: IMoveListRequest & { userId: string }) => {
//     return moveListService(data, data.userId).then(response => {
//         return response;
//     }).catch((err) => {
//         console.log('catch in index.ts');
//         console.log('error status: ' + err.status);
//         console.log('error message: ' + err.message);
//         throw new functions.https.HttpsError(err.status, err.message);
//     });
// });

export const moveTask = functions.https.onCall((data: IMoveTaskRequest, context: CallableContext) => {
    return moveTaskService(data, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const moveTaskTest = functions.https.onCall((data: IMoveTaskRequest & { userId: string }) => {
//     return moveTaskService(data, data.userId).then(response => {
//         return response;
//     }).catch((err) => {
//         console.log('catch in index.ts');
//         console.log('error status: ' + err.status);
//         console.log('error message: ' + err.message);
//         throw new functions.https.HttpsError(err.status, err.message);
//     });
// });

export const addViewer = functions.https.onCall((data: IAddViewerRequest, context: CallableContext) => {
    return addViewerService(data, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const addViewerTest = functions.https.onCall((data: IAddViewerRequest & { userId: string }) => {
//     return addViewerService(data, data.userId).then(response => {
//         return response;
//     }).catch((err) => {
//         console.log('catch in index.ts');
//         console.log('error status: ' + err.status);
//         console.log('error message: ' + err.message);
//         throw new functions.https.HttpsError(err.status, err.message);
//     });
// });

export const removeViewer = functions.https.onCall((data: IRemoveViewerRequest, context: CallableContext) => {
    return removeViewerService(data, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const removeViewerTest = functions.https.onCall((data: IRemoveViewerRequest & { userId: string }) => {
//     return removeViewerService(data, data.userId).then(response => {
//         return response;
//     }).catch((err) => {
//         console.log('catch in index.ts');
//         console.log('error status: ' + err.status);
//         console.log('error message: ' + err.message);
//         throw new functions.https.HttpsError(err.status, err.message);
//     });
// });

export const unsubBoard = functions.https.onCall((data: IUnsubBoardRequest, context: CallableContext) => {
    return unsubBoardService(data, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const unsubBoardTest = functions.https.onCall((data: IUnsubBoardRequest & { userId: string }) => {
//     return unsubBoardService(data, data.userId).then(response => {
//         return response;
//     }).catch((err) => {
//         console.log('catch in index.ts');
//         console.log('error status: ' + err.status);
//         console.log('error message: ' + err.message);
//         throw new functions.https.HttpsError(err.status, err.message);
//     });
// });

export const searchUsersByEmail = functions.https.onCall((data: ISearchUsersRequest, context: CallableContext) => {
    return searchUsersByEmailService(data, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const searchUsersByEmailTest = functions.https.onCall((data: ISearchUsersRequest & { userId: string }) => {
//     return searchUsersByEmailService(data, data.userId).then(response => {
//         return response;
//     }).catch((err) => {
//         console.log('catch in index.ts');
//         console.log('error status: ' + err.status);
//         console.log('error message: ' + err.message);
//         throw new functions.https.HttpsError(err.status, err.message);
//     });
// });

export const onTaskAttachmentDelete = functions.firestore.document("attachments/{attachmentId}").onDelete((snap) => {
    onAttachmentDeletedService(snap);
});

export const addAttachment = functions.https.onCall((data: IAddAttachmentRequest, context: CallableContext) => {
    return addAttachmentService(data, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const addAttachmentTest = functions.https.onCall((data: IAddAttachmentRequest & { userId: string }) => {
//     return addAttachmentService(data, data.userId).then(response => {
//         return response;
//     }).catch((err) => {
//         console.log('catch in index.ts');
//         console.log('error status: ' + err.status);
//         console.log('error message: ' + err.message);
//         throw new functions.https.HttpsError(err.status, err.message);
//     });
// });

export const removeAttachment = functions.https.onCall((data: IRemoveAttachmentRequest, context: CallableContext) => {
    return removeAttachmentService(data, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const removeAttachmentTest = functions.https.onCall((data: IRemoveAttachmentRequest & { userId: string }) => {
//     return removeAttachmentService(data, data.userId).then(response => {
//         return response;
//     }).catch((err) => {
//         console.log('catch in index.ts');
//         console.log('error status: ' + err.status);
//         console.log('error message: ' + err.message);
//         throw new functions.https.HttpsError(err.status, err.message);
//     });
// });

export const setAttachmentUrl = functions.https.onCall((data: ISetAttachmentUrlRequest, context: CallableContext) => {
    return setAttachmentUrlService(data, context.auth.uid).then(response => {
        return response;
    }).catch((err) => {
        console.log('catch in index.ts');
        console.log('error status: ' + err.status);
        console.log('error message: ' + err.message);
        throw new functions.https.HttpsError(err.status, err.message);
    });
});

// export const setAttachmentUrlTest = functions.https.onCall((data: ISetAttachmentUrlRequest & { userId: string }) => {
//     return setAttachmentUrlService(data, data.userId).then(response => {
//         return response;
//     }).catch((err) => {
//         console.log('catch in index.ts');
//         console.log('error status: ' + err.status);
//         console.log('error message: ' + err.message);
//         throw new functions.https.HttpsError(err.status, err.message);
//     });
// });
