import { CanvasCoord } from "./coord";

export class CanvasVect {
    x: number; // integer
    y: number; // integer

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static from_canvas_coords(src: CanvasCoord, dest: CanvasCoord): CanvasVect{
        return new CanvasVect(dest.x - src.x, dest.y - src.y);
    }
}

export class ServerVect {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}