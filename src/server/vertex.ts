import { Coord } from './coord';

export class Vertex {
    pos: Coord;
    color: string;

    constructor(x: number, y: number) {
        this.pos = new Coord(x, y);
        this.color = "black";
    }
}

