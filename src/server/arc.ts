export class Arc {

    start_vertex: number;
    end_vertex: number;
    selected: boolean;

    constructor(start_vertex: number, end_vertex: number) {
        this.start_vertex = start_vertex;
        this.end_vertex = end_vertex;
        this.selected = false;
    }

    copy_from(arc: Arc) { // used maybe temporarily for socket transmission of graphs
        this.start_vertex = arc.start_vertex;
        this.end_vertex = arc.end_vertex;
        this.selected = arc.selected;
    }
}