export class Coord {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    copy_from(c: Coord) {
        this.x = c.x;
        this.y = c.y;
    }

    sub(c: Coord) {
        return new Coord(this.x - c.x, this.y - c.y);
    }

    copy() {
        return new Coord(this.x, this.y);
    }

    getTheta(v: Coord) {
        let angle1 = Math.atan2(this.x, this.y);
        let angle2 = Math.atan2(v.x, v.y);
        return angle2 - angle1;
    }

    norm2() {
        return this.x ** 2 + this.y ** 2;
    }

    getRho(v: Coord) {
        let d1 = this.norm2();
        let d2 = v.norm2();
        return Math.sqrt(d2 / d1);
    }

    translate(shift: Coord) {
        this.x += shift.x;
        this.y += shift.y;
    }

    rtranslate(shift: Coord) {
        this.x -= shift.x;
        this.y -= shift.y;
    }

    opposite(): Coord {
        return new Coord(-this.x, -this.y);
    }
}

export function middle(c1: Coord, c2: Coord) {
    return new Coord((c1.x + c2.x) / 2, (c1.y + c2.y) / 2)
}


