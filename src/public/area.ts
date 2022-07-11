import { view } from "./camera";
import { Link, LocalVertex, local_graph, ServerCoord } from "./local_graph";

export class Area{
    c1 : ServerCoord;
    c2 : ServerCoord;
    color:string;
    label:string;

    // TODO: change vertices and links into Array of indices? And add Array<number> in Local Vertex / Link ? 
    vertices : Map<number, LocalVertex>;
    links: Map<number, Link>;
    
    constructor(label:string, c1:ServerCoord, c2:ServerCoord){
        this.c1 = c1;
        this.c2 = c2;
        this.label = label;
        this.color = "#ee4512";
        this.vertices = new Map();
        this.links = new Map();

        for (const [index, v] of local_graph.vertices.entries()) {
            if(v.is_in_rect(view.canvasCoord(c1), view.canvasCoord(c2))){
                this.vertices.set(index, v);
            }
        }

        for (const [index, e] of local_graph.links.entries()){
            const u = local_graph.vertices.get(e.start_vertex);
            const v = local_graph.vertices.get(e.end_vertex);

            if((u.is_in_rect(view.canvasCoord(c1), view.canvasCoord(c2))) && (v.is_in_rect(view.canvasCoord(c1), view.canvasCoord(c2)))){
                this.links.set(index, e);
            }
        }

        console.log(this.vertices, this.links);
    }
    
}