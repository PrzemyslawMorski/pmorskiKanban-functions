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

