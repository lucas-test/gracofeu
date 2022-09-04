import { local_board } from "../setup";
import { bezierValue, solutionQuadratic } from "../utils";
import { View } from "./camera";

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

    copy_from(c: Coord){
        this.x = c.x;
        this.y = c.y;
    }
}

export class CanvasCoord extends Coord {
    lol: number;

    copy(){
        return new CanvasCoord(this.x, this.y);
    }

    copy_from(c: CanvasCoord){
        this.x = c.x;
        this.y = c.y;
    }

    sub2(c: CanvasCoord) {
        return new CanvasCoord(this.x - c.x, this.y - c.y);
    }

    add2(c: CanvasCoord) {
        return new CanvasCoord(this.x + c.x, this.y + c.y);
    }

    middle( c: CanvasCoord){
        return new CanvasCoord((this.x + c.x) /2 , (this.y+ c.y)/2);
    }

    is_in_rect(c1: CanvasCoord, c2: CanvasCoord) : boolean {
        return Math.min(c1.x, c2.x) <= this.x && this.x <= Math.max(c1.x, c2.x) &&  Math.min(c1.y, c2.y) <= this.y && this.y <= Math.max(c1.y, c2.y);
    }


    // return boolean
    // true if the square of size 10 centered on this intersects the bezier Curve from c1 to c2 with control point cp
    is_nearby_beziers_1cp(c1: CanvasCoord, cp: CanvasCoord, c2: CanvasCoord): boolean {

        let xA = this.x - 5
        let yA = this.y - 5
        let xB = this.x + 5
        let yB = this.y + 5

        let minX = xA
        let minY = yA
        let maxX = xB
        let maxY = yB

        let x0 = c1.x;
        let y0 = c1.y;
        let x1 = cp.x;
        let y1 = cp.y;
        let x2 = c2.x;
        let y2 = c2.y;

        // case where one of the endvertices is already on the box
        if (c1.is_in_rect(new CanvasCoord(xA, yA), new CanvasCoord(xB, yB)) || c1.is_in_rect(new CanvasCoord(xA, yA), new CanvasCoord(xB, yB))) {
            return true
        } else {
            // we get the quadratic equation of the intersection of the bended edge and the sides of the box
            let aX = (x2 + x0 - 2 * x1);
            let bX = 2 * (x1 - x0);
            let cXmin = x0 - minX;
            let cXmax = x0 - maxX;

            let aY = (y2 + y0 - 2 * y1);
            let bY = 2 * (y1 - y0);
            let cYmin = y0 - minY;
            let cYmax = y0 - maxY;

            // the candidates for the intersections
            let tXmin = solutionQuadratic(aX, bX, cXmin);
            let tXmax = solutionQuadratic(aX, bX, cXmax);
            let tYmin = solutionQuadratic(aY, bY, cYmin);
            let tYmax = solutionQuadratic(aY, bY, cYmax);

            for (let t of tXmax.concat(tXmin)) { // we look for the candidates that are touching vertical sides
                if (t >= 0 && t <= 1) {
                    let y = bezierValue(t, y0, y1, y2);
                    if ((minY <= y && y <= maxY)) { // the candidate touches the box
                        return true;
                    }
                }
            }

            for (let t of tYmax.concat(tYmin)) {
                if (t >= 0 && t <= 1) {
                    let x = bezierValue(t, x0, x1, x2);
                    if ((minX <= x && x <= maxX)) {
                        return true;
                    }
                }
            }

        }
        return false;
    }
}

export class ServerCoord extends Coord {
    canvas_pos: CanvasCoord;
    old_canvas_pos: CanvasCoord;

    constructor(x:number, y:number){
        super(x,y);
        this.canvas_pos = local_board.view.canvasCoord(this);
        this.old_canvas_pos = this.canvas_pos.copy();
    }

    load_old_canvas_pos(){
        this.canvas_pos.copy_from(this.old_canvas_pos);
    }

    update_from_canvas_pos(view: View){
        const lol = view.serverCoord2(this.canvas_pos);
        this.x = lol.x;
        this.y = lol.y;
    }

    translate(shift: CanvasCoord, view: View){
        this.canvas_pos = this.old_canvas_pos.add2(shift);
        this.update_from_canvas_pos(view);
    }

    update_canvas_pos(view : View){
        this.canvas_pos = view.canvasCoord(this);
        this.old_canvas_pos.copy_from(this.canvas_pos);
    }

    update_canvas_pos_without_saving(view : View){
        this.canvas_pos = view.canvasCoord(this);
    }

    save_canvas_pos(){
        this.old_canvas_pos.copy_from(this.canvas_pos);
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

export function middle(c1: ServerCoord, c2: ServerCoord): ServerCoord {
    return new ServerCoord((c1.x + c2.x) / 2, (c1.y + c2.y) / 2)
}