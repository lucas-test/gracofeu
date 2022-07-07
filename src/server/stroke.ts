import { Coord } from "./coord";

export class Stroke{
    positions:Array<Coord>;
    old_pos:Coord;
    color:string;
    width:number;
    top_left: Coord;
    bot_right: Coord;
    
    constructor(positions:any, old_pos: Coord, color:string, width:number, top_left:Coord, bot_right:Coord){
        this.positions = positions;
        this.old_pos = old_pos;
        this.color = color;
        this.width = width;
        this.top_left = top_left;
        this.bot_right = bot_right;
    }

    // push(pos:Coord){
    //     this.positions.push(pos);
    //     this.max_x = Math.max(pos.x, this.max_x);
    //     this.min_x = Math.min(pos.x, this.min_x);
    //     this.max_y = Math.max(pos.y, this.max_y);
    //     this.min_y = Math.min(pos.y, this.min_y);
    // }

}