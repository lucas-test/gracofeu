import { Graph } from "../local_graph";




export class Parametor {
    name: string;
    id:string;
    compute: (g: Graph) => string;
    is_live:boolean;
    is_boolean:boolean;

    constructor(name: string, id:string, is_live:boolean, is_boolean:boolean) {
        this.name = name;
        this.id = id;
        this.is_live = is_live;
        this.is_boolean = is_boolean;
    }
}


