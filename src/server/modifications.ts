import { Coord } from "./coord";
import { ORIENTATION } from "./link";





export interface Modification { };


export class AddVertex implements Modification {
    index: number;
    x: number;
    y: number;

    constructor(index: number, x: number, y: number) {
        this.index = index;
        this.x = x;
        this.y = y;
    }
}

export class AddLink implements Modification {
    index: number;
    start_index: number;
    end_index: number;
    orientation: ORIENTATION

    constructor(index: number, start_index: number, end_index: number, orientation: ORIENTATION) {
        this.index = index;
        this.start_index = start_index;
        this.end_index = end_index;
        this.orientation = orientation;
    }
}

export class UpdateLinkWeight implements Modification {
    index: number;
    new_weight: string;
    previous_weight: string;

    constructor(index: number, new_weight: string, previous_weight: string) {
        this.index = index;
        this.new_weight = new_weight;
        this.previous_weight = previous_weight;
    }
}



export class UpdateSeveralVertexPos implements Modification {
    previous_positions: Map<number, Coord>;

    constructor(previous_positions: Map<number, Coord>) {
        this.previous_positions = previous_positions;
    }
}

export class TranslateVertices implements Modification {
    indices: Set<number>;
    shift: Coord;

    constructor(indices: Set<number>, shift: Coord){
        this.indices = indices;
        this.shift = shift;
    }
}

export class UpdateSeveralControlPoints implements Modification {
    previous_cps: Map<number, Coord>;

    constructor(previous_cps: Map<number, Coord>) {
        this.previous_cps = previous_cps;
    }
}