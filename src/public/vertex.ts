class Vertex {
    pos: Coord;
    selected: boolean;

    constructor(x: number, y: number) {
        this.pos = new Coord(x, y)
        this.selected = false;
    }

    dist2(x: number, y: number) {
        return (this.pos.x - x) ** 2 + (this.pos.y - y) ** 2
    }
}