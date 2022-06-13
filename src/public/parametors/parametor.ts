import { Graph } from "../local_graph";




export class Parametor {
    name: string;
    compute: (g: Graph) => string;

    constructor(name: string) {
        this.name = name;
    }
}


