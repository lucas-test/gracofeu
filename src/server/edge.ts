

export class Edge {
    start_vertex: number;
    end_vertex: number;
    selected: boolean;

    constructor(i: number, j: number) {
        this.start_vertex = i;
        this.end_vertex = j;
        this.selected = false;
    }
}

