import { IList } from "./IList";

export interface IBoard {
    readonly name: string;
    readonly id: string;
    readonly ownerId: string;
    readonly lists: IList[];
}
