import { Coord } from './coord';

export class Vertex {
    pos: Coord;
    color: string;
    weight: string;

    constructor(x: number, y: number, weight: string) {
        this.pos = new Coord(x, y);
        this.color = "black";
        this.weight = weight;
    }
}

