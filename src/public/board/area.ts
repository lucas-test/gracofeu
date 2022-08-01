import { CanvasCoord, corner_bottom_right, corner_top_left, ServerCoord } from "./coord";
import { Multicolor } from "../multicolor";
import { View } from "./camera";
import { LocalVertex } from "./vertex";


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
    multicolor:Multicolor;
    label:string;
    id:number;

    constructor(id: number, label:string, c1:ServerCoord, c2:ServerCoord, color:string){
        this.corner_top_left = corner_top_left(c1,c2);
        this.corner_bottom_right = corner_bottom_right(c1,c2);
        this.label = label;
        this.multicolor = new Multicolor(color);
        this.id = id;
    }

    is_nearby(pos:CanvasCoord, r?:number){ 
        // ____________________
        // |                   |
        // |__       KO        |
        // |OK|________________|
        if(r == undefined){
            r = 30;
        }
        const BL = new CanvasCoord(this.corner_top_left.canvas_pos.x, this.corner_bottom_right.canvas_pos.y)
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

        const c1canvas = this.corner_top_left.canvas_pos;
        const c2canvas = this.corner_bottom_right.canvas_pos;  
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

    top_right_corner():ServerCoord{
        return new ServerCoord(this.corner_bottom_right.x, this.corner_top_left.y);
    }
    
    bot_left_corner():ServerCoord{
        return new ServerCoord(this.corner_top_left.x, this.corner_bottom_right.y);
    }


    is_nearby_top_left_corner(pos:CanvasCoord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const TL = this.corner_top_left.canvas_pos;
        return pos.x >= TL.x && pos.x <= TL.x + s && pos.y >= TL.y && pos.y <= TL.y + s;
    }

    is_nearby_top_right_corner(pos:CanvasCoord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const TR = new CanvasCoord(this.corner_bottom_right.canvas_pos.x, this.corner_top_left.canvas_pos.y)
        return pos.x <= TR.x && pos.x >= TR.x - s && pos.y >= TR.y && pos.y <= TR.y + s;
    }

    is_nearby_bot_left_corner(pos:CanvasCoord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const BL = new CanvasCoord(this.corner_top_left.canvas_pos.x, this.corner_bottom_right.canvas_pos.y)
        return pos.x >= BL.x && pos.x <= BL.x + s && pos.y >= BL.y - s && pos.y <= BL.y;
    }

    is_nearby_bot_right_corner(pos:CanvasCoord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const BR = this.corner_bottom_right.canvas_pos;
        return pos.x <= BR.x && pos.x >= BR.x - s && pos.y >= BR.y - s && pos.y <= BR.y;
    }

    recompute_corners(view: View){
        const c1 = this.corner_top_left.canvas_pos.copy();
        const c2 = this.corner_bottom_right.canvas_pos.copy();
        this.corner_top_left.canvas_pos.x = Math.min(c1.x, c2.x);
        this.corner_top_left.canvas_pos.y = Math.min(c1.y, c2.y);
        this.corner_bottom_right.canvas_pos.x = Math.max(c1.x, c2.x);
        this.corner_bottom_right.canvas_pos.y = Math.max(c1.y, c2.y);
        this.corner_top_left.update_from_canvas_pos(view);
        this.corner_bottom_right.update_from_canvas_pos(view);
    }

    load_old_canvas_corners(){
        this.corner_bottom_right.load_old_canvas_pos();
        this.corner_top_left.load_old_canvas_pos();
    }


    resize_side_area(pos:CanvasCoord, side_number:AREA_SIDE, view: View){
        this.load_old_canvas_corners();
        switch(side_number){
            case AREA_SIDE.TOP:
                this.corner_top_left.canvas_pos.y = pos.y;
                break;
            case AREA_SIDE.RIGHT:
                this.corner_bottom_right.canvas_pos.x = pos.x;
                break;
            case AREA_SIDE.BOT:
                this.corner_bottom_right.canvas_pos.y = pos.y;
                break;
            case AREA_SIDE.LEFT:
                this.corner_top_left.canvas_pos.x = pos.x;
                break;
            default:
                break;
        }
        this.recompute_corners(view);
    }



    resize_corner_area(pos:CanvasCoord, corner_number:AREA_CORNER, view: View){
        this.load_old_canvas_corners();
        switch(corner_number){
            case AREA_CORNER.TOP_LEFT:
                this.corner_top_left.canvas_pos.copy_from(pos);
                break;
            case AREA_CORNER.TOP_RIGHT:
                this.corner_top_left.canvas_pos.y = pos.y;
                this.corner_bottom_right.canvas_pos.x = pos.x;
                break;
            case AREA_CORNER.BOT_RIGHT:
                this.corner_bottom_right.canvas_pos.copy_from(pos);
                break;
            case AREA_CORNER.BOT_LEFT:
                this.corner_bottom_right.canvas_pos.y = pos.y;
                this.corner_top_left.canvas_pos.x = pos.x;
                break;
            default:
                break;
        }
        this.recompute_corners(view);
    }

    translate(shift: CanvasCoord, view: View){
        this.corner_bottom_right.translate(shift, view);
        this.corner_top_left.translate(shift, view);
    }

    update_canvas_pos(view: View){
        this.corner_bottom_right.update_canvas_pos(view);
        this.corner_top_left.update_canvas_pos(view); 
    }

    save_canvas_pos(){
        this.corner_bottom_right.save_canvas_pos();
        this.corner_top_left.save_canvas_pos();
    }

    is_containing_vertex(v: LocalVertex): boolean{
        return v.is_in_rect(this.corner_top_left.canvas_pos, this.corner_bottom_right.canvas_pos);
    }
   
}




