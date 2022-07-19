import { view } from "./camera";
import { Coord, Graph, ServerCoord } from "./local_graph";
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

    is_nearby(pos:Coord, r:number){
        // ____________________
        // |                   |
        // |__       KO        |
        // |OK|________________|

        const BL = view.canvasCoord(new ServerCoord(Math.min(this.c1.x, this.c2.x) + 10, Math.max(this.c1.y, this.c2.y) - 10));
        return BL.is_nearby(pos, r);
    }

    is_nearby_corner(pos:Coord, r?:number):AREA_CORNER{
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

    is_nearby_side(pos:Coord, r?:number):AREA_SIDE{
        if(r == undefined){
            r = 100;
        }

        const c1canvas = view.canvasCoord(this.c1);
        const c2canvas = view.canvasCoord(this.c2);  
        const minX = Math.min(c1canvas.x, c2canvas.x);
        const minY = Math.min(c1canvas.y, c2canvas.y);
        const maxX = Math.max(c1canvas.x, c2canvas.x);
        const maxY = Math.max(c1canvas.y, c2canvas.y);

        if(pos.x < maxX && pos.x > minX && Math.abs(pos.y - minY) < r){
            return AREA_SIDE.TOP;
        }
        if(pos.y < maxY && pos.y > minY && Math.abs(pos.x - maxX) < r){
            return AREA_SIDE.RIGHT;
        }
        if(pos.x < maxX && pos.x > minX && Math.abs(pos.y - maxY) < r){
            return AREA_SIDE.BOT;
        }
        if(pos.y < maxY && pos.y > minY && Math.abs(pos.x - minX) < r){
            return AREA_SIDE.LEFT;
        }

        return AREA_SIDE.NONE;
    }

    get_subgraph(g:Graph){
        const subgraph = new Graph();
        const c1canvas = view.canvasCoord(this.c1);
        const c2canvas = view.canvasCoord(this.c2);   

         for (const [index, v] of g.vertices.entries()) {
            if(v.is_in_rect(c1canvas, c2canvas)){
                subgraph.vertices.set(index, v);
            }
        }

        for (const [index, e] of g.links.entries()){
            const u = g.vertices.get(e.start_vertex);
            const v = g.vertices.get(e.end_vertex);

            if((u.is_in_rect(c1canvas, c2canvas)) && (v.is_in_rect(c1canvas, c2canvas))){
                subgraph.links.set(index, e);
            }
        }
        return subgraph;
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


    is_nearby_top_left_corner(pos:Coord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const TL = this.top_left_corner();
        return pos.x > TL.x && pos.x < TL.x + s && pos.y > TL.y && pos.y < TL.y + s;
    }

    is_nearby_top_right_corner(pos:Coord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const TR = this.top_right_corner();
        return pos.x < TR.x && pos.x > TR.x - s && pos.y > TR.y && pos.y < TR.y + s;
    }

    is_nearby_bot_left_corner(pos:Coord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const BL = this.bot_left_corner();
        return pos.x > BL.x && pos.x < BL.x + s && pos.y > BL.y - s && pos.y < BL.y;
    }

    is_nearby_bot_right_corner(pos:Coord, s?:number){      
        if(s == undefined){
            s = 20;
        }
        const BR = this.bot_right_corner();
        return pos.x < BR.x && pos.x > BR.x - s && pos.y > BR.y - s && pos.y < BR.y;
    }
}

