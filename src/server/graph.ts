
import { Link, ORIENTATION } from './link';
import { Vertex } from './vertex';

import { Coord, middle } from './coord';

export class Graph {
    vertices: Map<number, Vertex>;
    links: Map<number, Link>;

    constructor() {
        this.vertices = new Map();
        this.links = new Map();
    }


    get_next_available_index() {
        let index = 0;
        while (this.vertices.has(index)) {
            index += 1;
        }
        return index;
    }

    get_next_available_index_links() {
        let index = 0;
        while (this.links.has(index)) {
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




    add_link(i: number, j: number, orientation: ORIENTATION) {
        for (const link of this.links.values()) {
            if (link.orientation == orientation) {
                if (orientation == ORIENTATION.UNDIRECTED) {
                    if ((link.start_vertex == i && link.end_vertex == j) || (link.start_vertex == j && link.end_vertex == i)) {
                        return;
                    }
                }
                else if (orientation == ORIENTATION.DIRECTED) {
                    if (link.start_vertex == i && link.end_vertex == j) {
                        return;
                    }
                }
            }


        }

        const index = this.get_next_available_index_links();
        const v1 = this.vertices.get(i);
        const v2 = this.vertices.get(j);
        this.links.set(index, new Link(i, j, middle(v1.pos, v2.pos), orientation));
        return index;
    }

    add_link_with_cp(i: number, j: number, orientation: ORIENTATION, cp: Coord) {
        const index = this.add_link(i, j, orientation);
        const link = this.links.get(index);
        link.cp.copy_from(cp);
    }




    get_neighbors_list(i: number) {
        let neighbors = new Array<number>();
        for (let e of this.links.values()) {
            if (e.orientation == ORIENTATION.UNDIRECTED) {
                if (e.start_vertex == i) {
                    neighbors.push(e.end_vertex);
                } else if (e.end_vertex == i) {
                    neighbors.push(e.start_vertex);
                }
            }
        }
        return neighbors;
    }

    delete_vertex(vertex_index: number) {
        this.vertices.delete(vertex_index);

        this.links.forEach((link, link_index) => {
            if (link.end_vertex === vertex_index || link.start_vertex === vertex_index) {
                this.links.delete(link_index);
            }
        })
    }

    delete_link(link_index: number) {
        this.links.delete(link_index);
    }

    clear() {
        this.vertices.clear();
        this.links.clear();
    }

}


