import { Coord } from "../server/coord";

export class User{
    label:string;
    color:string;
    pos:Coord;

    constructor(label:string, color:string, pos:Coord){
        this.label =  label;
        this.color = color;
        this.pos = pos;
    }
    
}

export let users = new Map<string, User>();