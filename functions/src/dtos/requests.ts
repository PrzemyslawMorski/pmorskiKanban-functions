export interface IGetBoardRequest {
    boardId: string;
}

export interface IGetGravatarUrlRequest {
    email: string;
}

export interface IRenameBoardRequest {
    boardId: string;
    boardName: string;
}

export interface ICreateBoardRequest {
    boardName: string
}

export interface IDeleteBoardRequest {
    boardId: string;
}

export interface ICreateListRequest {
    boardId: string;
    listName: string;
}

export interface IDeleteListRequest {
    boardId: string;
    listId: string;
}

export interface IRenameListRequest {
    boardId: string;
    listId: string;
    listName: string;
}

export interface ICreateTaskRequest {
    boardId: string;
    listId: string;
    taskName: string;
}

export interface IDeleteTaskRequest {
    boardId: string;
    listId: string;
    taskId: string;
}

export interface IRenameTaskRequest {
    boardId: string;
    listId: string;
    newTaskName: string;
    taskId: string;
}

export interface IChangeTaskDescriptionRequest {
    boardId: string;
    listId: string;
    newTaskDescription: string;
    taskId: string;
}

export interface IMoveListRequest {
    boardId: string;
    listId: string;
    srcPrevListId: string;
    srcNextListId: string;
    targetPrevListId: string;
    targetNextListId: string;
}

export interface IMoveTaskRequest {
    boardId: string;
    listId: string;
    srcNextTaskId: string;
    srcPrevTaskId: string;
    targetListId: string;
    targetNextTaskId: string;
    targetPrevTaskId: string;
    taskId: string;
}

export interface ISearchUsersRequest {
    boardId: string;
    phrase: string;
}

export interface IAddViewerRequest {
    boardId: string;
    userId: string;
}

export interface IRemoveViewerRequest {
    boardId: string;
    userId: string;
}

export interface IUnsubBoardRequest {
    boardId: string;
}
