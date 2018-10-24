export interface ITask {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly listId: string;
    readonly prevTask: string;
    readonly nextTask: string;
}
