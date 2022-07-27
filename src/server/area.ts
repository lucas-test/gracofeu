import { Coord } from "./coord";

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

    // get_subgraph(g:Graph){
    //     const subgraph = new Graph(); 

    //      for (const [index, v] of g.vertices.entries()) {
    //         if(v.is_in_rect(this.c1, this.c2)){
    //             subgraph.vertices.set(index, v);
    //         }
    //     }

    //     for (const [index, e] of g.links.entries()){
    //         const u = g.vertices.get(e.start_vertex);
    //         const v = g.vertices.get(e.end_vertex);

    //         if((u.is_in_rect(this.c1, this.c2)) && (v.is_in_rect(this.c1, this.c2))){
    //             subgraph.links.set(index, e);
    //         }
    //     }
    //     return subgraph;
    // }
}