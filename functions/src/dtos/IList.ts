import { ITask } from "./ITask";

export interface IList {
    readonly name: string;
    readonly id: string;
    readonly boardId: string;
    readonly tasks: ITask[];
    readonly prevListId: string;
    readonly nextListId: string;
}
