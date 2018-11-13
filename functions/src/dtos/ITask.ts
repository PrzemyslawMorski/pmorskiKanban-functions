import {IAttachment} from "./IAttachment";

export interface ITask {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly listId: string;
    readonly prevTaskId: string;
    readonly nextTaskId: string;
    readonly attachments: IAttachment[];
}
