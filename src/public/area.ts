import { init_parametor_div } from "./area_div";
import { center_canvas_on_rectangle, view } from "./camera";
import { CanvasCoord, corner_bottom_right, corner_top_left, ServerCoord } from "./coord";
import { draw } from "./draw";
import { Graph } from "./local_graph";
import { Multicolor } from "./multicolor";
import { Parametor } from "./parametors/parametor";
import { params_available, params_loaded } from "./parametors/parametor_manager";
import { socket } from "./socket";


export enum AREA_CORNER {
    NONE = 0,
    TOP_LEFT = 1,
    TOP_RIGHT = 2,
    BOT_RIGHT = 3,
    BOT_LEFT = 4
}

export enum AREA_SIDE{
    NONE = 0,
    TOP = 1,
    RIGHT = 2,
    BOT = 3,
    LEFT = 4
}

export class Area{
    corner_top_left : ServerCoord;
    corner_bottom_right : ServerCoord;
    old_corner_top_left: ServerCoord;
    old_corner_bottom_right: ServerCoord;
    multicolor:Multicolor;
    label:string;
    id:string;

    constructor(id: string, label:string, c1:ServerCoord, c2:ServerCoord, color:string){
        this.corner_top_left = corner_top_left(c1,c2);
        this.corner_bottom_right = corner_bottom_right(c1,c2);
        this.old_corner_bottom_right = this.corner_bottom_right.copy();
        this.old_corner_top_left = this.corner_top_left.copy();
        this.label = label;
        this.multicolor = new Multicolor(color);
        this.id = id;
    }

    is_nearby(pos:CanvasCoord, r:number){ 
        // ____________________
        // |                   |
        // |__       KO        |
        // |OK|________________|

        const BL = view.canvasCoord(new ServerCoord(this.corner_top_left.x + 10, this.corner_bottom_right.y - 10));
        return BL.is_nearby(pos, r);
    }

    is_nearby_corner(pos:CanvasCoord, r?:number):AREA_CORNER{
        if(this.is_nearby_top_left_corner(pos, r)){
            return AREA_CORNER.TOP_LEFT;
        }

        if(this.is_nearby_top_right_corner(pos, r)){
            return AREA_CORNER.TOP_RIGHT;
        }

        if(this.is_nearby_bot_right_corner(pos, r)){
            return AREA_CORNER.BOT_RIGHT;
        }

        if(this.is_nearby_bot_left_corner(pos, r)){
            return AREA_CORNER.BOT_LEFT;
        }
        return AREA_CORNER.NONE;
    }

    is_nearby_side(pos:CanvasCoord, r?:number, avoid_corners?:boolean):AREA_SIDE{
        if(r == undefined){
            r = 5;
        }

        if(avoid_corners == undefined){
            avoid_corners = false;
        }
        let shift = avoid_corners?20:0;

        const c1canvas = view.canvasCoord(this.corner_top_left);
        const c2canvas = view.canvasCoord(this.corner_bottom_right);  
        const minX = Math.min(c1canvas.x, c2canvas.x);
        const minY = Math.min(c1canvas.y, c2canvas.y);
        const maxX = Math.max(c1canvas.x, c2canvas.x);
        const maxY = Math.max(c1canvas.y, c2canvas.y);

        if(pos.x < maxX - shift && pos.x > minX + shift && Math.abs(pos.y - minY) < r){
            return AREA_SIDE.TOP;
        }
        if(pos.y < maxY - shift && pos.y > minY + shift && Math.abs(pos.x - maxX) < r){
            return AREA_SIDE.RIGHT;
        }
        if(pos.x < maxX - shift && pos.x > minX + shift && Math.abs(pos.y - maxY) < r){
            return AREA_SIDE.BOT;
        }
        if(pos.y < maxY - shift && pos.y > minY + shift && Math.abs(pos.x - minX) < r){
            return AREA_SIDE.LEFT;
        }

        return AREA_SIDE.NONE;
    }


    top_left_corner():ServerCoord{
        return this.corner_top_left;
    }

    top_right_corner():ServerCoord{
        return new ServerCoord(this.corner_bottom_right.x, this.corner_top_left.y);
    }
    
    bot_right_corner():ServerCoord{
        return this.corner_bottom_right;
    }
    
    bot_left_corner():ServerCoord{
        return new ServerCoord(this.corner_top_left.x, this.corner_bottom_right.y);
    }


    is_nearby_top_left_corner(pos:CanvasCoord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const TL = this.top_left_corner().canvas_pos;
        return pos.x > TL.x && pos.x < TL.x + s && pos.y > TL.y && pos.y < TL.y + s;
    }

    is_nearby_top_right_corner(pos:CanvasCoord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const TR = this.top_right_corner().canvas_pos;
        return pos.x < TR.x && pos.x > TR.x - s && pos.y > TR.y && pos.y < TR.y + s;
    }

    is_nearby_bot_left_corner(pos:CanvasCoord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const BL = this.bot_left_corner().canvas_pos;
        return pos.x > BL.x && pos.x < BL.x + s && pos.y > BL.y - s && pos.y < BL.y;
    }

    is_nearby_bot_right_corner(pos:CanvasCoord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const BR = this.bot_right_corner().canvas_pos;
        return pos.x < BR.x && pos.x > BR.x - s && pos.y > BR.y - s && pos.y < BR.y;
    }

    recompute_corners(){
        const c1 = this.corner_top_left;
        const c2 = this.corner_bottom_right;
        this.corner_top_left = corner_top_left(c1,c2);
        this.corner_bottom_right = corner_bottom_right(c1,c2);
    }

    load_old_corners(){
        this.corner_bottom_right = this.old_corner_bottom_right.copy();
        this.corner_top_left = this.old_corner_top_left.copy();
    }


    resize_side_area(pos:ServerCoord, side_number:AREA_SIDE){
        this.load_old_corners();
        switch(side_number){
            case AREA_SIDE.TOP:
                this.corner_top_left.y = pos.y;
                break;
            case AREA_SIDE.RIGHT:
                this.corner_bottom_right.x = pos.x;
                break;
            case AREA_SIDE.BOT:
                this.corner_bottom_right.y = pos.y;
                break;
            case AREA_SIDE.LEFT:
                this.corner_top_left.x = pos.x;
                break;
            default:
                break;
        }
        this.recompute_corners();
    }



    resize_corner_area(pos:ServerCoord, corner_number:AREA_CORNER){
        this.load_old_corners();
        switch(corner_number){
            case AREA_CORNER.TOP_LEFT:
                this.corner_top_left = pos;
                break;
            case AREA_CORNER.TOP_RIGHT:
                this.corner_top_left.y = pos.y;
                this.corner_bottom_right.x = pos.x;
                break;
            case AREA_CORNER.BOT_RIGHT:
                this.corner_bottom_right = pos;
                break;
            case AREA_CORNER.BOT_LEFT:
                this.corner_bottom_right.y = pos.y;
                this.corner_top_left.x = pos.x;
                break;
            default:
                break;
        }
        this.recompute_corners();
    }

    translate(vector: CanvasCoord){
        this.load_old_corners();
        const c1 = view.canvasCoord(this.corner_bottom_right);
        this.corner_bottom_right = view.serverCoord2(c1.add2(vector));
        const c2 = view.canvasCoord(this.corner_top_left);
        this.corner_top_left = view.serverCoord2(c2.add2(vector));
    }


   
}




