import {IUser} from "./IUser";

export interface IComment {
    id: string;
    content: string;
    author: IUser | null;
    timestamp: number;
    boardId: string;
    listId: string;
    taskId: string;
}