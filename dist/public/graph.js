class Coord {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Vertex {
    constructor(x, y) {
        this.pos = new Coord(x, y);
    }
}
class Graph {
    constructor() {
        this.vertices = new Map();
    }
    add_vertex(x, y) {
        let index = 0;
        while (this.vertices.has(index)) {
            index += 1;
        }
        this.vertices.set(index, new Vertex(x, y));
    }
}
//# sourceMappingURL=graph.js.map