
import { Edge } from './edge';
import { Vertex } from './vertex';

export class Graph {
    vertices: Map<number, Vertex>;
    edges: Array<Edge>;

    constructor() {
        this.vertices = new Map();
        this.edges = new Array();
    }


    get_next_available_index() {
        let index = 0;
        while (this.vertices.has(index)) {
            index += 1;
        }
        return index;
    }


    get_index(v: Vertex) {
        for (let [index, vertex] of this.vertices.entries()) {
            if (vertex === v) {
                return index;
            }
        }
        return;
    }


    add_vertex(x: number, y: number) {
        let index = this.get_next_available_index();
        this.vertices.set(index, new Vertex(x, y));
        return index;
    }


    add_edge(i: number, j: number) {

        for (let e of this.edges) {
            if ((e.start_vertex == i && e.end_vertex == j) || (e.start_vertex == j && e.end_vertex == i)) {
                return
            }
        }

        this.edges.push(new Edge(i, j));
    }


    get_neighbors_list(i: number) {
        let neighbors = [];
        for (let e of this.edges) {
            if (e.start_vertex == i) {
                neighbors.push(e.end_vertex);
            } else if (e.end_vertex == i) {
                neighbors.push(e.start_vertex);
            }
        }
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


