import { IBoardMiniature } from "./IBoardMiniature";
import { IBoard } from "./IBoard";
import { IList } from "./IList";
import { ITask } from "./ITask";

export interface IGetBoardMiniaturesResponse {
    boardMiniatures: IBoardMiniature[] | null;
}

export interface IGetBoardResponse {
    board: IBoard | null;
}

export interface IGetGravatarUrlResponse {
    gravatarUrl: string | null;
}

export interface IRenameBoardResponse {
    boardId: string | null;
    newBoardName: string | null;
}

export interface ICreateBoardResponse {
    newBoard: IBoard | null;
}

export interface IDeleteBoardResponse {
    boardId: string | null;
}

export interface ICreateListResponse {
    boardId: string | null;
    newList: IList | null;
}

export interface IDeleteListResponse {
    boardId: string | null;
    listId: string | null;
}

export interface IRenameListResponse {
    boardId: string | null;
    listId: string | null;
    newListName: string | null;
}

export interface ICreateTaskResponse {
    boardId: string | null;
    listId: string | null;
    task: ITask | null;
}

export interface IDeleteTaskResponse {
    boardId: string | null;
    listId: string | null;
    taskId: string | null;
}
