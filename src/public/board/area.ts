import { View } from "./camera";
import { CanvasCoord, ClientVertex } from "./vertex";
import { Area, Coord } from "gramoloss";
import { CanvasVect } from "./vect";


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

export class ClientArea extends Area{
    canvas_corner_top_left : CanvasCoord;
    canvas_corner_bottom_left : CanvasCoord;
    canvas_corner_bottom_right : CanvasCoord;
    canvas_corner_top_right : CanvasCoord;

    constructor(label:string, c1:Coord, c2:Coord, color:string, view: View){
        super(label, c1, c2, color);
        this.canvas_corner_top_left = view.create_canvas_coord(this.top_left_corner());
        this.canvas_corner_bottom_left = view.create_canvas_coord(this.bot_left_corner());
        this.canvas_corner_bottom_right = view.create_canvas_coord(this.bot_right_corner());
        this.canvas_corner_top_right = view.create_canvas_coord(this.top_right_corner());
    }

    is_nearby(pos:CanvasCoord, r?:number){ 
        // ____________________
        // |                   |
        // |__       KO        |
        // |OK|________________|
        if(r == undefined){
            r = 30;
        }
        const BL = this.canvas_corner_bottom_left;
        return pos.x >= BL.x && pos.x <= BL.x + r && pos.y >= BL.y - r && pos.y <= BL.y;
  


        // const BL = new CanvasCoord(this.corner_top_left.canvas_pos.x + 10, this.corner_bottom_right.canvas_pos.y - 10);
        // return BL.is_nearby(pos, r);
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

        const c1canvas = this.canvas_corner_bottom_left;
        const c2canvas = this.canvas_corner_top_right;
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

    /*
    top_left_canvas_corner(): CanvasCoord{
        return new CanvasCoord(Math.min(this.c1_canvas_pos.x, this.c2_canvas_pos.x), Math.min(this.c1_canvas_pos.y, this.c2_canvas_pos.y))
    }

    top_right_canvas_corner(): CanvasCoord{
        return new CanvasCoord(Math.max(this.c1_canvas_pos.x, this.c2_canvas_pos.x), Math.min(this.c1_canvas_pos.y, this.c2_canvas_pos.y))
    }
    
    bot_left_canvas_corner(): Coord{
        return new CanvasCoord(Math.min(this.c1_canvas_pos.x, this.c2_canvas_pos.x), Math.max(this.c1_canvas_pos.y, this.c2_canvas_pos.y))
    }

    bot_right_canvas_corner(): Coord{
        return new CanvasCoord(Math.max(this.c1_canvas_pos.x, this.c2_canvas_pos.x), Math.max(this.c1_canvas_pos.y, this.c2_canvas_pos.y))
    }
    */


    is_nearby_top_left_corner(pos:CanvasCoord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const TL = this.canvas_corner_top_left;
        return pos.x >= TL.x && pos.x <= TL.x + s && pos.y >= TL.y && pos.y <= TL.y + s;
    }

    is_nearby_top_right_corner(pos:CanvasCoord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const TR = this.canvas_corner_top_right;
        return pos.x <= TR.x && pos.x >= TR.x - s && pos.y >= TR.y && pos.y <= TR.y + s;
    }

    is_nearby_bot_left_corner(pos:CanvasCoord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const BL = this.canvas_corner_bottom_left;
        return pos.x >= BL.x && pos.x <= BL.x + s && pos.y >= BL.y - s && pos.y <= BL.y;
    }

    is_nearby_bot_right_corner(pos:CanvasCoord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const BR = this.canvas_corner_bottom_right;
        return pos.x <= BR.x && pos.x >= BR.x - s && pos.y >= BR.y - s && pos.y <= BR.y;
    }

    
    // supposing only CanvasCornerTopLeft and BotRight have been changed
    recompute_corners(view: View){
        const c1 = this.canvas_corner_top_left.copy();
        const c2 = this.canvas_corner_bottom_right.copy();
        this.canvas_corner_top_left.x = Math.min(c1.x, c2.x);
        this.canvas_corner_top_left.y = Math.min(c1.y, c2.y);
        this.canvas_corner_bottom_right.x = Math.max(c1.x, c2.x);
        this.canvas_corner_bottom_right.y = Math.max(c1.y, c2.y);
        this.c1 = view.create_server_coord(this.canvas_corner_top_left);
        this.c2 = view.create_server_coord(this.canvas_corner_bottom_right);
    }
    




    resize_side_area(pos:CanvasCoord, side_number:AREA_SIDE, view: View){
        switch(side_number){
            case AREA_SIDE.TOP:
                this.canvas_corner_top_left.y = pos.y;
                break;
            case AREA_SIDE.RIGHT:
                this.canvas_corner_bottom_right.x = pos.x;
                break;
            case AREA_SIDE.BOT:
                this.canvas_corner_bottom_right.y = pos.y;
                break;
            case AREA_SIDE.LEFT:
                this.canvas_corner_top_left.x = pos.x;
                break;
            default:
                break;
        }
        this.recompute_corners(view);
    }



    resize_corner_area(pos:CanvasCoord, corner_number:AREA_CORNER, view: View){
        switch(corner_number){
            case AREA_CORNER.TOP_LEFT:
                this.canvas_corner_top_left.copy_from(pos);
                break;
            case AREA_CORNER.TOP_RIGHT:
                this.canvas_corner_top_left.y = pos.y;
                this.canvas_corner_bottom_right.x = pos.x;
                break;
            case AREA_CORNER.BOT_RIGHT:
                this.canvas_corner_bottom_right.copy_from(pos);
                break;
            case AREA_CORNER.BOT_LEFT:
                this.canvas_corner_bottom_right.y = pos.y;
                this.canvas_corner_top_left.x = pos.x;
                break;
            default:
                break;
        }
        this.recompute_corners(view);
    }

    translate_by_canvas_vect(shift: CanvasVect, view: View){
        this.canvas_corner_bottom_left.translate_by_canvas_vect(shift);
        this.canvas_corner_bottom_right.translate_by_canvas_vect(shift);
        this.canvas_corner_top_left.translate_by_canvas_vect(shift);
        this.canvas_corner_top_right.translate_by_canvas_vect(shift);
        this.c1.translate(view.server_vect(shift));
        this.c2.translate(view.server_vect(shift));
    }

    update_canvas_pos(view: View){
        this.canvas_corner_top_left = view.create_canvas_coord(this.top_left_corner());
        this.canvas_corner_bottom_left = view.create_canvas_coord(this.bot_left_corner());
        this.canvas_corner_bottom_right = view.create_canvas_coord(this.bot_right_corner());
        this.canvas_corner_top_right = view.create_canvas_coord(this.top_right_corner());
    }

   
}




