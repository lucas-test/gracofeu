export class Coord {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export function middle(c1: Coord, c2: Coord) {
    return new Coord((c1.x + c2.x) / 2, (c1.y + c2.y) / 2)
}


