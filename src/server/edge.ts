import { Coord } from "./coord";


export class Edge {
    start_vertex: number;
    end_vertex: number;
    cp: Coord; // control point

    constructor(i: number, j: number, cp: Coord) {
        this.start_vertex = i;
        this.end_vertex = j;
        this.cp = cp;
    }


}

