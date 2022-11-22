import { View } from "./camera";
import { BasicColorName } from "../basic_colors";
import { Coord, Stroke } from "gramoloss";
import { CanvasCoord } from "./vertex";
import { CanvasVect } from "./vect";

export class ClientStroke extends Stroke{
    canvas_positions: Array<CanvasCoord>;
    is_selected:boolean;
    canvas_corner_top_left: CanvasCoord;
    canvas_corner_bottom_right: CanvasCoord;
    
    constructor(pos:Array<Coord>, color:BasicColorName, width:number, view: View){
        super(pos, color, width);
        this.is_selected = false;
        this.canvas_positions = new Array();
        this.canvas_corner_top_left = view.create_canvas_coord(this.top_left);
        this.canvas_corner_bottom_right = view.create_canvas_coord(this.bot_right);
        for( let i = 0 ; i < this.positions.length; i ++){
            this.canvas_positions.push(view.create_canvas_coord(this.positions[i]));
        }
    }

    update_canvas_pos(view: View){
        for( let i = 0 ; i < this.positions.length; i ++){
            this.canvas_positions[i] = view.create_canvas_coord(this.positions[i]);
        }
    }

    is_nearby(pos:CanvasCoord, view: View): number | false{
        const bot_right_canvas = view.create_canvas_coord(this.bot_right);
        const top_left_canvas = view.create_canvas_coord(this.top_left);
        if (pos.x > bot_right_canvas.x +5 || pos.x < top_left_canvas.x - 5 || pos.y > bot_right_canvas.y +5 || pos.y < top_left_canvas.y - 5)
        {
            return false;
        }

        for(let i = 0; i<this.positions.length-1; i++){
            if(pos.is_nearby_beziers_1cp(this.canvas_positions[i], this.canvas_positions[i].middle(this.canvas_positions[i+1]) , this.canvas_positions[i+1] )){
                return i;
            }
        }

        return false;
    }


    push(cpos:CanvasCoord, view: View){
        const pos = view.create_server_coord(cpos);
        this.positions.push(pos);
        this.bot_right.x = Math.max(pos.x, this.bot_right.x);
        this.top_left.x = Math.min(pos.x, this.top_left.x);
        this.bot_right.y = Math.max(pos.y, this.bot_right.y);
        this.top_left.y = Math.min(pos.y, this.top_left.y);
        this.canvas_positions.push(cpos);
    }

    translate_by_canvas_vect(shift: CanvasVect, view: View){
        const server_shift = view.server_vect(shift);
        this.bot_right.translate(server_shift);
        this.top_left.translate(server_shift);
        for ( const position of this.positions){
            position.translate(server_shift);
        }

        for (const pos of this.canvas_positions){
            pos.translate_by_canvas_vect(shift);
        }
    }
}