import { Area } from "./area";
import { Coord } from "./coord";
import { Link, ORIENTATION } from "./link";
import { Stroke } from "./stroke";
import { Vertex } from "./vertex";


export enum ELEMENT_TYPE {
    VERTEX = "VERTEX",
    LINK = "LINK",
    STROKE = "STROKE",
    AREA = "AREA"
}


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

export class UpdateWeight implements Modification {
    element_type: ELEMENT_TYPE;
    index: number;
    new_weight: string;
    previous_weight: string;

    constructor(element_type: ELEMENT_TYPE, index: number, new_weight: string, previous_weight: string) {
        this.element_type = element_type;
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

    constructor(indices: Set<number>, shift: Coord) {
        this.indices = indices;
        this.shift = shift;
    }
}

export class TranslateControlPoints implements Modification {
    indices: Set<number>;
    shift: Coord;

    constructor(indices: Set<number>, shift: Coord) {
        this.indices = indices;
        this.shift = shift;
    }
}

export class TranslateStrokes implements Modification {
    indices: Set<number>;
    shift: Coord;

    constructor(indices: Set<number>, shift: Coord) {
        this.indices = indices;
        this.shift = shift;
    }
}

export class TranslateAreas implements Modification {
    indices: Set<number>;
    shift: Coord;

    constructor(indices: Set<number>, shift: Coord) {
        this.indices = indices;
        this.shift = shift;
    }
}


export class ColorModification {
    type: string;
    index: number;
    new_color: string;
    previous_color: string;

    constructor(type: string, index: number, new_color: string, previous_color: string) {
        this.type = type;
        this.index = index;
        this.new_color = new_color;
        this.previous_color = previous_color;
    }
}

export class UpdateColors implements Modification {
    data: Array<ColorModification>;

    constructor(data: Array<ColorModification>) {
        this.data = data;
    }
}

export class AddStroke implements Modification {
    index: number;
    stroke: Stroke;
    constructor(index: number, stroke: Stroke) {
        this.index = index;
        this.stroke = stroke;
    }
}

export class AddArea implements Modification {
    index: number;
    area: Area;
    constructor(index: number, area: Area) {
        this.index = index;
        this.area = area;
    }
}

export class AreaMoveSide implements Modification {
    index: number;
    previous_c1: Coord;
    previous_c2: Coord;
    new_c1: Coord;
    new_c2: Coord;

    constructor(index: number, previous_c1: Coord, previous_c2: Coord, new_c1: Coord, new_c2: Coord) {
        this.index = index;
        this.previous_c1 = previous_c1;
        this.previous_c2 = previous_c2;
        this.new_c1 = new_c1;
        this.new_c2 = new_c2;
    }

    static from_area(index: number, area: Area, x: number, y: number, side_number: number): AreaMoveSide {
        const new_c1 = area.c1.copy();
        const new_c2 = area.c2.copy();

        switch (side_number) {
            case 1:
                if (area.c1.y > area.c2.y) { new_c2.y = y; }
                else { new_c1.y = y; }
                break;
            case 2:
                if (area.c1.x > area.c2.x) { new_c1.x = x; }
                else { new_c2.x = x; }
                break;
            case 3:
                if (area.c1.y < area.c2.y) { new_c2.y = y; }
                else { new_c1.y = y; }
                break;
            case 4:
                if (area.c1.x < area.c2.x) { new_c1.x = x; }
                else { new_c2.x = x; }
                break;
        }

        return new AreaMoveSide(index, area.c1, area.c2, new_c1, new_c2);
    }
}

export class AreaMoveCorner implements Modification {
    index: number;
    previous_c1: Coord;
    previous_c2: Coord;
    new_c1: Coord;
    new_c2: Coord;

    constructor(index: number, previous_c1: Coord, previous_c2: Coord, new_c1: Coord, new_c2: Coord) {
        this.index = index;
        this.previous_c1 = previous_c1;
        this.previous_c2 = previous_c2;
        this.new_c1 = new_c1;
        this.new_c2 = new_c2;
    }

    static from_area(index: number, area: Area, x: number, y: number, corner_number: number): AreaMoveCorner {
        const new_c1 = area.c1.copy();
        const new_c2 = area.c2.copy();

        switch (corner_number) {
            case 1:
                if (area.c1.x < area.c2.x) { new_c1.x = x; }
                else { new_c2.x = x; }
                if (area.c1.y > area.c2.y) { new_c2.y = y; }
                else { new_c1.y = y; }
                break;
            case 2:
                if (area.c1.x > area.c2.x) { new_c1.x = x; }
                else { new_c2.x = x; }
                if (area.c1.y > area.c2.y) { new_c2.y = y; }
                else { new_c1.y = y; }
                break;
            case 3:
                if (area.c1.x > area.c2.x) { new_c1.x = x; }
                else { new_c2.x = x; }
                if (area.c1.y < area.c2.y) { new_c2.y = y; }
                else { new_c1.y = y; }
                break;
            case 4:
                if (area.c1.x < area.c2.x) { new_c1.x = x; }
                else { new_c2.x = x; }
                if (area.c1.y < area.c2.y) { new_c2.y = y; }
                else { new_c1.y = y; }
                break;
        }

        return new AreaMoveCorner(index, area.c1, area.c2, new_c1, new_c2);
    }
}


export class DeleteElements implements Modification {
    vertices: Map<number, Vertex>;
    links: Map<number, Link>;
    strokes: Map<number, Stroke>;
    areas: Map<number, Area>;

    constructor(vertices, links, strokes, areas) {
        this.vertices = vertices;
        this.links = links;
        this.strokes = strokes;
        this.areas = areas;
    }
}

export class VerticesMerge implements Modification {
    index_vertex_fixed: number;
    index_vertex_to_remove: number;
    vertex_to_remove: Vertex;
    deleted_links: Map<number, Link>;
    added_link_indices: Array<number>;

    constructor(index_vertex_fixed: number, index_vertex_to_remove: number, vertex_to_remove: Vertex, deleted_links: Map<number, Link>, added_link_indices: Array<number>) {
        this.index_vertex_fixed = index_vertex_fixed;
        this.index_vertex_to_remove = index_vertex_to_remove;
        this.vertex_to_remove = vertex_to_remove;
        this.deleted_links = deleted_links;
        this.added_link_indices = added_link_indices;
    }
}

export class GraphPaste implements Modification {
    added_vertices: Map<number, Vertex>;
    added_links: Map<number, Link>;

    constructor(added_vertices, added_links){
        this.added_vertices = added_vertices;
        this.added_links = added_links;
    }
}