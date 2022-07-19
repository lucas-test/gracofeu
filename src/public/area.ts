import { view } from "./camera";
import { CanvasCoord, Coord, ServerCoord } from "./coord";
import { Multicolor } from "./multicolor";


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
    c1 : ServerCoord;
    c2 : ServerCoord;
    multicolor:Multicolor;
    label:string;
    id:string;

    constructor(id: string, label:string, c1:ServerCoord, c2:ServerCoord, color:string){
        this.c1 = c1;
        this.c2 = c2;
        this.label = label;
        this.multicolor = new Multicolor(color);
        this.id = id;
    }

    is_nearby(pos:CanvasCoord, r:number){ 
        // TODO ne pas utiliser Coord seul car on ne sait pas si c'est serveur ou canvas
        // ____________________
        // |                   |
        // |__       KO        |
        // |OK|________________|

        const BL = view.canvasCoord(new ServerCoord(Math.min(this.c1.x, this.c2.x) + 10, Math.max(this.c1.y, this.c2.y) - 10));
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

        const c1canvas = view.canvasCoord(this.c1);
        const c2canvas = view.canvasCoord(this.c2);  
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
        return new ServerCoord(Math.min(this.c1.x, this.c2.x), Math.min(this.c1.y, this.c2.y));
    }

    top_right_corner():ServerCoord{
        return new ServerCoord(Math.max(this.c1.x, this.c2.x), Math.min(this.c1.y, this.c2.y));
    }
    
    bot_right_corner():ServerCoord{
        return new ServerCoord(Math.max(this.c1.x, this.c2.x), Math.max(this.c1.y, this.c2.y));
    }
    
    bot_left_corner():ServerCoord{
        return new ServerCoord(Math.min(this.c1.x, this.c2.x), Math.max(this.c1.y, this.c2.y));
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


    resize_side_area(pos:ServerCoord, side_number:AREA_SIDE){
        switch(side_number){
            case AREA_SIDE.TOP:
                if(this.c1.y > this.c2.y){ this.c2.y = pos.y; }
                else{  this.c1.y = pos.y; }
                break;
            case AREA_SIDE.RIGHT:
                if(this.c1.x > this.c2.x){ this.c1.x = pos.x; }
                else{ this.c2.x = pos.x; }
                break;
            case AREA_SIDE.BOT:
                if(this.c1.y < this.c2.y){ this.c2.y = pos.y; }
                else{ this.c1.y = pos.y; }
                break;
            case AREA_SIDE.LEFT:
                if(this.c1.x < this.c2.x){ this.c1.x = pos.x; }
                else{ this.c2.x = pos.x; }
                break;
            default:
                break;
        }
    }



    resize_corner_area(pos:ServerCoord, corner_number:AREA_CORNER){
        switch(corner_number){
            case AREA_CORNER.TOP_LEFT:
                if(this.c1.x < this.c2.x){ this.c1.x = pos.x; }
                else{ this.c2.x = pos.x; }
                if(this.c1.y > this.c2.y){  this.c2.y = pos.y; }
                else{ this.c1.y = pos.y; }
                break;
            case AREA_CORNER.TOP_RIGHT:
                if(this.c1.x > this.c2.x){ this.c1.x = pos.x; }
                else{ this.c2.x = pos.x; }
                if(this.c1.y > this.c2.y){ this.c2.y = pos.y; }
                else{ this.c1.y = pos.y; }
                break;
            case AREA_CORNER.BOT_RIGHT:
                if(this.c1.x > this.c2.x){ this.c1.x = pos.x; }
                else{ this.c2.x = pos.x; }
                if(this.c1.y < this.c2.y){ this.c2.y = pos.y; }
                else{ this.c1.y = pos.y; }
                break;
            case AREA_CORNER.BOT_LEFT:
                if(this.c1.x < this.c2.x){ this.c1.x = pos.x; }
                else{ this.c2.x = pos.x; }
                if(this.c1.y < this.c2.y){ this.c2.y = pos.y; }
                else{ this.c1.y = pos.y; }
                break;
            default:
                break;
        }
    }
    
}

