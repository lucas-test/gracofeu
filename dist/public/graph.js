class Coord {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Vertex {
    constructor(x, y) {
        this.pos = new Coord(x, y);
        this.selected = false;
    }
    draw(ctx) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 8, 0, 2 * Math.PI);
        ctx.fill();
    }
    dist2(x, y) {
        return Math.pow((this.pos.x - x), 2) + Math.pow((this.pos.y - y), 2);
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
        return index;
    }
}
//# sourceMappingURL=graph.js.map