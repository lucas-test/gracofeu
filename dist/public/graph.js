class Graph {
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
    get_index(v) {
        for (let [index, vertex] of this.vertices.entries()) {
            if (vertex === v) {
                return index;
            }
        }
        return;
    }
    add_vertex(x, y) {
        let index = this.get_next_available_index();
        this.vertices.set(index, new Vertex(x, y));
        return index;
    }
    add_edge(i, j) {
        for (let e of this.edges) {
            if ((e.start_vertex == i && e.end_vertex == j) || (e.start_vertex == j && e.end_vertex == i)) {
                return;
            }
        }
        this.edges.push(new Edge(i, j));
    }
    get_neighbors_list(i) {
        let neighbors = [];
        for (let e of this.edges) {
            if (e.start_vertex == i) {
                neighbors.push(e.end_vertex);
            }
            else if (e.end_vertex == i) {
                neighbors.push(e.start_vertex);
            }
        }
    }
}
//# sourceMappingURL=graph.js.map