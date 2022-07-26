import { CanvasCoord, ServerCoord } from "./coord";
import { Multicolor } from "../multicolor";
import { local_board } from "../setup";
import { View } from "./camera";

export class Stroke{
    positions:Array<ServerCoord>;
    multicolor:Multicolor;
    width:number;
    top_left: ServerCoord;
    bot_right: ServerCoord;
    is_selected:boolean;
    
    constructor(pos:Array<ServerCoord>, color:string, width:number){
        this.positions = pos;
        this.multicolor = new Multicolor(color);
        this.width = width;
        this.is_selected = false;
        if(pos.length>0){
            this.top_left = new ServerCoord(pos[0].x, pos[0].y);
            this.bot_right = new ServerCoord(pos[0].x, pos[0].y);
            for(let i = 1; i<pos.length; i++){
                this.bot_right.x = Math.max(pos[i].x, this.bot_right.x);
                this.top_left.x = Math.min(pos[i].x, this.top_left.x);
                this.bot_right.y = Math.max(pos[i].y, this.bot_right.y);
                this.top_left.y = Math.min(pos[i].y, this.top_left.y);
            }
            this.top_left.update_canvas_pos(local_board.view);
            this.bot_right.update_canvas_pos(local_board.view);
        }
        else{
            this.top_left = null;
            this.bot_right = null;
        }
    }

    update_canvas_pos(view: View){
        this.bot_right.update_canvas_pos(view);
        this.top_left.update_canvas_pos(view);
        for( const position of this.positions){
            position.update_canvas_pos(view);
        }
    }

    is_nearby(pos:CanvasCoord): number | false{
        const bot_right_canvas = this.bot_right.canvas_pos;
        const top_left_canvas = this.top_left.canvas_pos;
        if (pos.x > bot_right_canvas.x +5 || pos.x < top_left_canvas.x - 5 || pos.y > bot_right_canvas.y +5 || pos.y < top_left_canvas.y - 5)
        {
            return false;
        }

        for(let i = 0; i<this.positions.length-1; i++){
            if(pos.is_nearby_beziers_1cp(this.positions[i].canvas_pos, this.positions[i].canvas_pos.middle(this.positions[i+1].canvas_pos) , this.positions[i+1].canvas_pos )){
                return i;
            }
        }

        return false;
    }


    push(pos:ServerCoord){
        this.positions.push(pos);
        this.bot_right.x = Math.max(pos.x, this.bot_right.x);
        this.top_left.x = Math.min(pos.x, this.top_left.x);
        this.bot_right.y = Math.max(pos.y, this.bot_right.y);
        this.top_left.y = Math.min(pos.y, this.top_left.y);
    }

    translate(shift: CanvasCoord, view: View){
        this.bot_right.translate(shift, view);
        this.top_left.translate(shift, view);
        for ( const position of this.positions){
            position.translate(shift, view);
        }
    }
}