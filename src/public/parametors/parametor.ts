import { Graph } from "../local_graph";




export class Parametor {
    name: string;
    id:string;
    compute: (g: Graph) => string;

    constructor(name: string, id:string) {
        this.name = name;
        this.id = id;
    }
}


