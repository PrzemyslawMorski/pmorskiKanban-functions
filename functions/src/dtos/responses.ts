import {IBoardMiniature} from "./IBoardMiniature";
import {IBoard} from "./IBoard";
import {IList} from "./IList";
import {ITask} from "./ITask";
import {IUser} from "./IUser";
import {IAttachment} from "./IAttachment";
import {IComment} from "./IComment";

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

export interface IRenameTaskResponse {
    boardId: string;
    listId: string;
    newTaskName: string;
    taskId: string;
}

export interface IChangeTaskDescriptionResponse {
    boardId: string;
    listId: string;
    newTaskDescription: string;
    taskId: string;
}

export interface IMoveListResponse {
    boardId: string;
    listId: string;
}

export interface IMoveTaskResponse {
    boardId: string;
    listId: string;
    targetListId: string;
    taskId: string;
}

export interface ISearchUsersResponse {
    boardId: string;
    users: IUser[];
}

export interface IAddViewerResponse {
    boardId: string;
    userId: string;
}

export interface IRemoveViewerResponse {
    boardId: string;
    userId: string;
}

export interface IUnsubBoardResponse {
    boardId: string;
    userId: string;
}

export interface ISetAttachmentUrlResponse {
    attachment: IAttachment;
}

export interface IRemoveAttachmentResponse {
    boardId: string;
    listId: string;
    taskId: string;
    attachmentId: string;
}

export interface ICreateAttachmentResponse {
    boardId: string;
    listId: string;
    taskId: string;
    attachmentId: string;
}

export interface IAddCommentResponse {
    comment: IComment;
}

export interface IDeleteCommentResponse {
    boardId: string;
    listId: string;
    taskId: string;
    commentId: string;
}

export interface IEditCommentResponse {
    comment: IComment;
}
