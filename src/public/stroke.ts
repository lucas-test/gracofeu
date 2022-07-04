import { CanvasCoord, Coord, ServerCoord } from "./local_graph";

export class Stroke{
    pos:ServerCoord;
    color:string;
    width:number;
    next:Stroke;
    pred:Stroke;
    min_prev_x: number;
    max_prev_x: number;
    min_prev_y: number;
    max_prev_y: number;
    last:Stroke;
    
    constructor(pos:ServerCoord, color:string, width:number, pred:Stroke){
        this.pos = pos;
        this.pred = pred;
        this.color = color;
        this.width = width;
        this.next = null;
        if(pred !== null){
            pred.next = this;
            this.max_prev_x = Math.max(pos.x, pred.max_prev_x);
            this.min_prev_x = Math.min(pos.x, pred.min_prev_x);
            this.max_prev_y = Math.max(pos.y, pred.max_prev_y);
            this.min_prev_y = Math.min(pos.y, pred.min_prev_y);
        }
        else{
            this.max_prev_x = pos.x;
            this.min_prev_x = pos.x;
            this.max_prev_y = pos.y;
            this.min_prev_y = pos.y;
        }
        this.last = null;
    }

    is_last(){
        return this.next === null;
    }

    set_last(last:Stroke){
        this.last = last;
        if(this.pred !== null){
            this.pred.set_last(last);
        }
    }

    is_nearby(pos:Coord, r:number){
        if (pos.x > this.max_prev_x || pos.x < this.min_prev_x || pos.y > this.max_prev_y || pos.y < this.min_prev_y)
        {
            return false;
        }
        else if(this.pred === null){
            return (pos.dist2(this.pos) <= r);
        }
        else{

        // TODO: Next to the LINE between the two last instead of checking the vertices only.
            return (pos.dist2(this.pos) <= r) || this.pred.is_nearby(pos, r);
        }
    }

}