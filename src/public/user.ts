import { ServerCoord } from "./local_graph";


export class User {
    label: string;
    color: string;
    pos: ServerCoord;

    constructor(label: string, color: string, pos: ServerCoord) {
        this.label = label;
        this.color = color;
        this.pos = pos;
    }

}

export let users = new Map<string, User>();