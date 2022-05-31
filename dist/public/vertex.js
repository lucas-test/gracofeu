class Vertex {
    constructor(x, y) {
        this.pos = new Coord(x, y);
        this.selected = false;
    }
    dist2(x, y) {
        return Math.pow((this.pos.x - x), 2) + Math.pow((this.pos.y - y), 2);
    }
}
//# sourceMappingURL=vertex.js.map