export class Coord {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}



export class LocalVertex {
    pos: Coord;
    old_pos: Coord;
    is_selected: boolean;

    constructor(pos: Coord) {
        this.pos = pos;
        this.old_pos = pos;
        this.is_selected = false;
    }

    dist2(x: number, y: number) {
        return (this.pos.x - x) ** 2 + (this.pos.y - y) ** 2
    }


    is_nearby(x: number, y: number, r: number) {
        return this.dist2(x, y) <= r;
    }

}








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

export class Graph {
    vertices: Map<number, LocalVertex>;
    edges: Array<Edge>;

    constructor() {
        this.vertices = new Map();
        this.edges = new Array();
    }


     deselect_all_vertices() {
        this.vertices.forEach(vertex => {
            vertex.is_selected = false;
        });
    }

      get_vertex_index_nearby(x: number, y: number) {
        for (let index of this.vertices.keys()) {
            let v = this.vertices.get(index);
            if (v.is_nearby(x, y, 150)) {
                return index;
            }
        }
        return null;
    }

}


export const local_graph = new Graph();