import { Area } from "../board/area";
import { Graph } from "../board/graph";

export enum SENSIBILITY {
    GEOMETRIC = "GEOMETRIC", // Move of vertex/link
    COLOR = "COLOR", // Change of color for vertices/links
    ELEMENT = "ELEMENT", // Create/delete vertex/link
    WEIGHT = "WEIGHT"
}


function get_sensibility(s: string){
    switch(s){
        case "ELEMENT":
            return SENSIBILITY.ELEMENT;
        case "GEOMETRIC":
            return SENSIBILITY.GEOMETRIC;
        case "COLOR":
            return SENSIBILITY.COLOR;
        case "WEIGHT":
            return SENSIBILITY.WEIGHT;
    }
}

export function get_sensibilities(s:Array<string>) : Set<SENSIBILITY>{
    return new Set(s.map(e => get_sensibility(e)));
}

export class Parametor {
    name: string;
    id:string;
    compute: (g: Graph, verbose: boolean) => string;
    is_live:boolean;
    is_boolean:boolean;
    sensibility:Set<SENSIBILITY>;
    short_name:string;
    title:string;
    has_info:boolean;

    // Instance
    is_verbose: boolean;

    constructor(name: string, id:string, short_name:string, title:string, is_live:boolean, is_boolean:boolean, sensibility:Array<SENSIBILITY>, has_info:boolean) {
        this.name = name;
        this.id = id;
        this.short_name = short_name;
        this.title = title;
        this.is_live = is_live;
        this.is_boolean = is_boolean;
        this.sensibility = new Set(sensibility);
        this.has_info = has_info;
    }

    is_sensible(s : Set<SENSIBILITY>){
        const intersection = new Set([...this.sensibility].filter(x=>s.has(x)));
        return intersection.size > 0;
    }

    get_parametor_html_id(a:Area){
        return this.id + "_area_" +( a==null?"null":a.id);
    }
}

/*

# Note on Async:

To make sleeps in compute function : 
- Change compute to Promise<string>
- add "async" to all compute functions
then you can use "await new Promise(resolve => setTimeout(resolve, 100));"
in the compute functions
(get canvas and ctx with export from setup to call draw)

---

compute: (g: Graph, verbose: boolean) => Promise<string>;

param_diameter.compute = ( async (g: Graph) =>{
    const FW = Floyd_Warhall(g, false);
    let diameter = 0;

    for(const v_index of g.vertices.keys()){
        g.vertices.get(v_index).color = "green";
        draw(canvas, ctx, g);
        await new Promise(resolve => setTimeout(resolve, 100)); 
        ...

*/
