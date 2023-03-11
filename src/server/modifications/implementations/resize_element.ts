import { Area, Coord, Rectangle, Representation, SENSIBILITY } from "gramoloss";
import { BoardModification, RESIZE_TYPE, ServerBoard } from "../modification";

export class ResizeElement implements BoardModification {
    element: Area | Rectangle | Representation;
    index: number;
    kind: string;
    previous_c1: Coord;
    previous_c2: Coord;
    new_c1: Coord;
    new_c2: Coord;

    constructor(element: Area | Rectangle | Representation, index: number, kind: string, previous_c1: Coord, previous_c2: Coord, new_c1: Coord, new_c2: Coord) {
        this.element = element;
        this.index = index;
        this.kind = kind;
        this.previous_c1 = previous_c1;
        this.previous_c2 = previous_c2;
        this.new_c1 = new_c1;
        this.new_c2 = new_c2;
    }

    static from_element(element: Area | Rectangle | Representation, index: number, kind: string, x: number, y: number, resize_type: RESIZE_TYPE): ResizeElement{
        const new_c1 = element.c1.copy();
        const new_c2 = element.c2.copy();

        switch (resize_type) {
            case RESIZE_TYPE.TOP:
                if (element.c1.y > element.c2.y) { new_c2.y = y; }
                else { new_c1.y = y; }
                break;
            case RESIZE_TYPE.RIGHT:
                if (element.c1.x > element.c2.x) { new_c1.x = x; }
                else { new_c2.x = x; }
                break;
            case RESIZE_TYPE.BOTTOM:
                if (element.c1.y < element.c2.y) { new_c2.y = y; }
                else { new_c1.y = y; }
                break;
            case RESIZE_TYPE.LEFT:
                if (element.c1.x < element.c2.x) { new_c1.x = x; }
                else { new_c2.x = x; }
                break;
            case RESIZE_TYPE.TOP_LEFT:{
                if (element.c1.x < element.c2.x) { new_c1.x = x; }
                else { new_c2.x = x; }
                if (element.c1.y > element.c2.y) { new_c2.y = y; }
                else { new_c1.y = y; }
                break;
            }
            case RESIZE_TYPE.TOP_RIGHT:{
                if (element.c1.x > element.c2.x) { new_c1.x = x; }
                else { new_c2.x = x; }
                if (element.c1.y > element.c2.y) { new_c2.y = y; }
                else { new_c1.y = y; }
                break;
            }
            case RESIZE_TYPE.BOTTOM_RIGHT:
                if (element.c1.x > element.c2.x) { new_c1.x = x; }
                else { new_c2.x = x; }
                if (element.c1.y < element.c2.y) { new_c2.y = y; }
                else { new_c1.y = y; }
                break;
            case RESIZE_TYPE.BOTTOM_LEFT:
                if (element.c1.x < element.c2.x) { new_c1.x = x; }
                else { new_c2.x = x; }
                if (element.c1.y < element.c2.y) { new_c2.y = y; }
                else { new_c1.y = y; }
                break;
        }

        return new ResizeElement(element, index, kind, element.c1, element.c2, new_c1, new_c2);
    }

    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        this.element.c1 = this.new_c1;
        this.element.c2 = this.new_c2;
        return new Set([]);
    }

    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        this.element.c1 = this.previous_c1;
        this.element.c2 = this.previous_c2;
        return new Set([]);
    }
}