import { view } from "./camera";
import { invertColor } from "./draw";
import { Coord, Graph, Link, LocalVertex, local_graph, ServerCoord } from "./local_graph";

export class Area{
    c1 : ServerCoord;
    c2 : ServerCoord;
    color:string;
    label:string;
    id:string;
    accent_color:string;

    
    constructor(id: string, label:string, c1:ServerCoord, c2:ServerCoord, color:string){
        this.c1 = c1;
        this.c2 = c2;
        this.label = label;
        this.color = color;
        this.id = id;
        this.accent_color = invertColor(color);
    }

    is_nearby(pos:Coord, r:number){
        // ____________________
        // |                   |
        // |__       KO        |
        // |OK|________________|

        const BL = view.canvasCoord(new ServerCoord(Math.min(this.c1.x, this.c2.x) + 10, Math.max(this.c1.y, this.c2.y) - 10));
        return BL.is_nearby(pos, r);
    }

    is_nearby_corner(pos:Coord, r:number){
        // TL(1)_____________TR(2)
        // |                   |
        // |                   |
        // BL(4)_____________BR(3)

        const TL = view.canvasCoord(new ServerCoord(Math.min(this.c1.x, this.c2.x), Math.min(this.c1.y, this.c2.y)));
        const TR = view.canvasCoord(new ServerCoord(Math.max(this.c1.x, this.c2.x), Math.min(this.c1.y, this.c2.y)));
        const BR = view.canvasCoord(new ServerCoord(Math.max(this.c1.x, this.c2.x), Math.max(this.c1.y, this.c2.y)));
        const BL = view.canvasCoord(new ServerCoord(Math.min(this.c1.x, this.c2.x), Math.max(this.c1.y, this.c2.y)));

        if(TL.is_nearby(pos, r)){
            return 1;
        }
        if(TR.is_nearby(pos, r)){
            return 2;
        }
        if(BR.is_nearby(pos, r)){
            return 3;
        }
        if(BL.is_nearby(pos, r)){
            return 4;
        }
        return false;
    }

    is_nearby_side(pos:Coord, r:number){
        // __________1_________
        // |                   |
        // 4                   2
        // |_________3_________|

        const c1canvas = view.canvasCoord(this.c1);
        const c2canvas = view.canvasCoord(this.c2);  
        const minX = Math.min(c1canvas.x, c2canvas.x);
        const minY = Math.min(c1canvas.y, c2canvas.y);
        const maxX = Math.max(c1canvas.x, c2canvas.x);
        const maxY = Math.max(c1canvas.y, c2canvas.y);

        if(pos.x < maxX && pos.x > minX && Math.abs(pos.y - minY) < r){
            return 1;
        }
        if(pos.y < maxY && pos.y > minY && Math.abs(pos.x - maxX) < r){
            return 2;
        }
        if(pos.x < maxX && pos.x > minX && Math.abs(pos.y - maxY) < r){
            return 3;
        }
        if(pos.y < maxY && pos.y > minY && Math.abs(pos.x - minX) < r){
            return 4;
        }

        return false;
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
}