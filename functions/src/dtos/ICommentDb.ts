export interface ICommentDb {
    id: string;
    content: string;
    authorId: string;
    timestamp: number;
    boardId: string;
    listId: string;
    taskId: string;
}