import {IList} from "./IList";
import {IUser} from "./IUser";

export interface IBoard {
    readonly name: string;
    readonly id: string;
    readonly owner: boolean;
    readonly lists: IList[];
    readonly viewers: IUser[];
}
