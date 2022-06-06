import { Coord } from '../../server/coord';
import { Vertex } from '../../server/vertex';
import { Edge } from '../../server/edge';
import { Graph } from '../../server/graph';



export class Parametor {
    name: string;
    compute: (g: Graph) => string;

    constructor(name: string) {
        this.name = name;
    }
}


