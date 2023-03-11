import { Board, Vertex, Link, Stroke, Area, TextZone, Representation, Rectangle, SENSIBILITY } from "gramoloss";

export enum RESIZE_TYPE {
    BOTTOM = "BOTTOM",
    TOP = "TOP",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    TOP_RIGHT = "TOP_RIGHT",
    TOP_LEFT = "TOP_LEFT",
    BOTTOM_RIGHT = "BOTTOM_RIGHT",
    BOTTOM_LEFT = "BOTTOM_LEFT"
}

export class ServerBoard extends Board<Vertex, Link, Stroke, Area, TextZone, Representation, Rectangle>{
    
}

export interface BoardModification { 
    try_implement(board: ServerBoard): Set<SENSIBILITY> | string;
    deimplement(board: ServerBoard): Set<SENSIBILITY>;
};
