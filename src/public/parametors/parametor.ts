import { Area } from "../area";
import { Graph } from "../local_graph";

export enum SENSIBILITY {
    GEOMETRIC = "GEOMETRIC", // Move of vertex/link
    COLOR = "COLOR", // Change of color for vertices/links
    ELEMENT = "ELEMENT" // Create/delete vertex/link
}


function get_sensibility(s: string){
    switch(s){
        case "ELEMENT":
            return SENSIBILITY.ELEMENT;
        case "GEOMETRIC":
            return SENSIBILITY.GEOMETRIC;
        case "COLOR":
            return SENSIBILITY.COLOR;
    }
}

export function get_sensibilities(s:Array<string>):Set<SENSIBILITY>{
    return new Set(s.map(e => get_sensibility(e)));
    // const sensi = new Set<SENSIBILITY>();
    // s.forEach(e => {
    //     sensi.add(get_sensibility(e));
    // });
    // return sensi;
}

export class Parametor {
    name: string;
    id:string;
    compute: (g: Graph) => string;
    is_live:boolean;
    is_boolean:boolean;
    sensibility:Set<SENSIBILITY>;

    constructor(name: string, id:string, is_live:boolean, is_boolean:boolean, sensibility:Array<SENSIBILITY>) {
        this.name = name;
        this.id = id;
        this.is_live = is_live;
        this.is_boolean = is_boolean;
        this.sensibility = new Set(sensibility);
    }

    is_sensible(s : Set<SENSIBILITY>){
        const intersection = new Set([...this.sensibility].filter(x=>s.has(x)));
        return intersection.size > 0;
    }

    get_parametor_html_id(a:Area){
        return this.id + "_area_" +( a==null?"null":a.id);
    }
}


