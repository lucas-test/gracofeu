
import { Edge } from './edge';
import { Vertex } from './vertex';
import { Arc } from './arc';

export class Graph {
    vertices: Map<number, Vertex>;
    // edges: Array<Edge>;
    // arcs: Array<Arc>;
    edges: Map<number, Edge>;
    arcs: Map<number, Arc>;

    constructor() {
        this.vertices = new Map();
        this.edges = new Map();
        this.arcs = new Map();
        // this.edges = new Array();
        // this.arcs = new Array();
    }


    get_next_available_index() {
        let index = 0;
        while (this.vertices.has(index)) {
            index += 1;
        }
        return index;
    }

    get_next_available_index_edges() {
        let index = 0;
        while (this.edges.has(index)) {
            index += 1;
        }
        return index;
    }

    get_next_available_index_arcs() {
        let index = 0;
        while (this.arcs.has(index)) {
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
        for (let e of this.edges.values()) {
            if ((e.start_vertex == i && e.end_vertex == j) || (e.start_vertex == j && e.end_vertex == i)) {
                return
            }
        }

        const index = this.get_next_available_index_edges();
        this.edges.set(index, new Edge(i, j));
    }

    add_arc(start_vertex_index: number, end_vertex_index: number) {
        for (let arc of this.arcs.values()) {
            if (arc.start_vertex == start_vertex_index && arc.end_vertex == end_vertex_index) {
                return
            }
        }

        const index = this.get_next_available_index_arcs();
        this.arcs.set(index, new Arc(start_vertex_index, end_vertex_index));
        
    }


    get_neighbors_list(i: number) {
        let neighbors = [];
        for (let e of this.edges.values()) {
            if (e.start_vertex == i) {
                neighbors.push(e.end_vertex);
            } else if (e.end_vertex == i) {
                neighbors.push(e.start_vertex);
            }
        }
    }

    // get_vertex_index_nearby(x: number, y: number, dx: number, dy:number) {
    //     for (let index of this.vertices.keys()) {
    //         let v = this.vertices.get(index);
    //         if (v.is_nearby(x-dx, y-dy, 150)) {
    //             return index;
    //         }
    //     }
    //     return null;
    // }

}


