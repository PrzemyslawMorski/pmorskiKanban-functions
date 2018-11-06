import { IList } from "./IList";

export interface IBoard {
    readonly name: string;
    readonly id: string;
    readonly owner: boolean;
    readonly lists: IList[];
}
