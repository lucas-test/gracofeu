

export class Edge {
    start_vertex: number;
    end_vertex: number;
    selected: boolean;

    constructor(i: number, j: number) {
        this.start_vertex = i;
        this.end_vertex = j;
        this.selected = false;
    }

    copy_from(edge: Edge) {
        this.start_vertex = edge.start_vertex;
        this.end_vertex = edge.end_vertex;
        this.selected = edge.selected;
    }
}

