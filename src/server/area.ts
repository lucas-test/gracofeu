import { Coord } from "./coord";
import { Vertex } from "./vertex";

export class Area{
    c1 : Coord;
    c2 : Coord;
    color:string;
    label:string;

    
    constructor(label:string, c1:Coord, c2:Coord, color:string){
        this.c1 = c1;
        this.c2 = c2;
        this.label = label;
        this.color = "#E60007";
    }

    translate(shift: Coord){
        this.c1.translate(shift);
        this.c2.translate(shift);
    }

    rtranslate(shift: Coord){
        this.c1.rtranslate(shift);
        this.c2.rtranslate(shift);
    }

    is_containing(v: Vertex): Boolean{
        return Math.min(this.c1.x, this.c2.x) <= v.pos.x && v.pos.x <= Math.max(this.c1.x, this.c2.x) &&  Math.min(this.c1.y, this.c2.y) <= v.pos.y && v.pos.y <= Math.max(this.c1.y, this.c2.y);
    }
}