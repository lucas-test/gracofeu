import { Server } from "socket.io";
import { view } from "./camera";

export class Coord {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    sub(c: Coord) {
        return new Coord(this.x - c.x, this.y - c.y);
    }

    add(c: Coord) {
        return new Coord(this.x + c.x, this.y + c.y);
    }

    dist2(pos: Coord) {
        return (this.x - pos.x) ** 2 + (this.y - pos.y) ** 2;
    }

    is_nearby(pos: Coord, r: number) {
        return this.dist2(pos) <= r;
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

    copy(){
        return new Coord(this.x, this.y);
    }
}

export class CanvasCoord extends Coord {
    lol: number;

    sub2(c: CanvasCoord) {
        return new CanvasCoord(this.x - c.x, this.y - c.y);
    }

    add2(c: CanvasCoord) {
        return new CanvasCoord(this.x + c.x, this.y + c.y);
    }

}

export class ServerCoord extends Coord {
    canvas_pos: CanvasCoord;

    constructor(x:number, y:number){
        super(x,y);
        this.canvas_pos = view.canvasCoord(this);
    }

    after_view_update(){
        this.canvas_pos = view.canvasCoord(this);
    }

    copy() {
        return new ServerCoord( this.x, this.y);
    }
}

export function corner_top_left(c1: ServerCoord, c2: ServerCoord){
    return new ServerCoord(Math.min(c1.x, c2.x), Math.min(c1.y,c2.y));
}

export function corner_bottom_left(c1: ServerCoord, c2: ServerCoord){
    return new ServerCoord(Math.min(c1.x, c2.x), Math.max(c1.y,c2.y));
}

export function corner_bottom_right(c1: ServerCoord, c2: ServerCoord){
    return new ServerCoord(Math.max(c1.x, c2.x), Math.max(c1.y,c2.y));
}

export function corner_top_right(c1: ServerCoord, c2: ServerCoord){
    return new ServerCoord(Math.max(c1.x, c2.x), Math.min(c1.y,c2.y));
}