export interface ITask {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly prevTask: ITask | null;
    readonly nextTask: ITask | null;
}
