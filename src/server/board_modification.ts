import { Area, Board, Coord, Graph, Link, Representation, SENSIBILITY, Stroke, TextZone, Vect, Vertex } from "gramoloss";
import { eqSet } from "./utils";

export class ServerBoard extends Board<Vertex, Link, Stroke, Area, TextZone, Representation>{
    
}

export interface BoardModification { 
    try_implement(board: ServerBoard): Set<SENSIBILITY> | string;
    deimplement(board: ServerBoard): Set<SENSIBILITY>;
};

export class ApplyModifyer implements BoardModification {
    old_vertices: Map<number, Vertex>;
    old_links: Map<number, Link>;
    new_vertices: Map<number, Vertex>;
    new_links: Map<number, Link>;

    constructor(old_vertices: Map<number, Vertex>, old_links: Map<number, Link>, new_vertices: Map<number, Vertex>,        new_links: Map<number, Link>){
        this.old_vertices = old_vertices;
        this.old_links = old_links;
        this.new_vertices = new_vertices;
        this.new_links = new_links;
    }

    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        board.graph.vertices = new Map();
        for ( const [vertex_index, vertex] of this.new_vertices.entries()){
            board.graph.vertices.set(vertex_index, vertex);
        }
        board.graph.links = new Map();
        for ( const [link_index, link] of this.new_links.entries()){
            board.graph.links.set(link_index, link);
        }
        return new Set([SENSIBILITY.ELEMENT]);
    }

    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        board.graph.vertices = new Map();
        for ( const [vertex_index, vertex] of this.old_vertices.entries()){
            board.graph.vertices.set(vertex_index, vertex);
        }
        board.graph.links = new Map();
        for ( const [link_index, link] of this.old_links.entries()){
            board.graph.links.set(link_index, link);
        }
        return new Set([SENSIBILITY.ELEMENT])
    }
}

export class AddElement implements BoardModification {
    kind: string;
    index: number;
    element: Vertex|Link|Stroke|Area|TextZone;
    
    constructor(kind: string, index: number, element: Vertex|Link|Stroke|Area|TextZone) {
        this.kind = kind;
        this.index = index;
        this.element = element;
    }

    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        if (this.kind == "TextZone"){
            if ( board.text_zones.has(this.index) ){
                return "index " + String(this.index) + " already exists in text_zones";
            } else {
                const element = this.element as TextZone;
                board.text_zones.set(this.index, element);
            }
        } else if (this.kind == "Vertex"){
            if ( board.graph.vertices.has(this.index) ){
                return "index " + String(this.index) + " already exists in vertices";
            } else {
                const element = this.element as Vertex;
                board.graph.vertices.set(this.index, element);
            }
        }else if (this.kind == "Link"){
            if ( board.graph.links.has(this.index) ){
                return "index " + String(this.index) + " already exists in links";
            } else {
                const link = this.element as Link;
                if (board.graph.check_link(link)){
                    board.graph.links.set(this.index, link);
                } else {
                    return "Error: link is not valid";
                }
            }
        }else if (this.kind == "Stroke"){
            if ( board.strokes.has(this.index) ){
                return "index " + String(this.index) + " already exists in strokes";
            } else {
                const element = this.element as Stroke;
                board.strokes.set(this.index, element);
            }
        }else if (this.kind == "Area"){
            if ( board.areas.has(this.index) ){
                return "index " + String(this.index) + " already exists in areas";
            } else {
                const element = this.element as Area;
                board.areas.set(this.index, element);
            }
        }
        return new Set();
    }

    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        if ( this.kind == "TextZone"){
            board.text_zones.delete(this.index);
        } else if (this.kind == "Stroke"){
            board.strokes.delete(this.index);
        } else if (this.kind == "Area"){
            board.areas.delete(this.index);
        } else if (this.kind == "Vertex"){
            board.graph.delete_vertex(this.index);
        } else if (this.kind == "Link"){
            board.graph.links.delete(this.index);
        }
        return new Set();
    }
}

export class UpdateElement implements BoardModification {
    index: number;
    kind: string;
    param: string;
    new_value: any;
    old_value: any;
    
    constructor(index: number, kind: string, param: string, new_value: any, old_value: any){
        this.index = index;
        this.kind = kind;
        this.param = param;
        this.new_value = new_value;
        this.old_value = old_value;
    }

    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        if (this.kind == "TextZone" && board.text_zones.has(this.index)){
            board.text_zones.get(this.index)[this.param] = this.new_value;
            return new Set();
        } else if (this.kind == "Vertex" && board.graph.vertices.has(this.index)){
            board.graph.vertices.get(this.index)[this.param] = this.new_value;
            return new Set()
        }else if (this.kind == "Link" && board.graph.links.has(this.index)){
            board.graph.links.get(this.index)[this.param] = this.new_value;
            return new Set()
        }else if (this.kind == "Stroke" && board.strokes.has(this.index)){
            board.strokes.get(this.index)[this.param] = this.new_value;
            return new Set()
        }else if (this.kind == "Area" && board.areas.has(this.index)){
            board.areas.get(this.index)[this.param] = this.new_value;
            return new Set()
        }else {
            return "Error: index not in text_zones";
        }
    }

    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        if (this.kind == "TextZone" && board.text_zones.has(this.index)){
            board.text_zones.get(this.index)[this.param]  = this.old_value;
            return new Set();
        }else if (this.kind == "Vertex" && board.graph.vertices.has(this.index)){
            board.graph.vertices.get(this.index)[this.param] = this.old_value;
            return new Set([SENSIBILITY.COLOR])
        }else if (this.kind == "Link" && board.graph.links.has(this.index)){
            board.graph.links.get(this.index)[this.param] = this.old_value;
            return new Set()
        }else if (this.kind == "Stroke" && board.strokes.has(this.index)){
            board.strokes.get(this.index)[this.param] = this.old_value;
            return new Set()
        }else if (this.kind == "Area" && board.areas.has(this.index)){
            board.areas.get(this.index)[this.param] = this.old_value;
            return new Set()
        }
        return new Set();
    }
}


export class TranslateElements implements BoardModification {
    indices: Array<[string,number]>;
    shift: Vect;
    
    constructor(indices: Array<[string,number]>, shift: Vect){
        this.indices = indices;
        this.shift = shift;
    }

    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        for (const [kind, index] of this.indices) {
            if (kind == "TextZone"){
                if (board.text_zones.has(index)){
                    board.text_zones.get(index).pos.translate(this.shift);
                }else {
                    return "Error: index not in text_zones";
                }
            } else if (kind == "Stroke"){
                if (board.strokes.has(index)){
                    board.strokes.get(index).translate(this.shift);
                }else {
                    return "Error: index not in strokes";
                }
            } else if (kind == "Area"){
                if (board.areas.has(index)){
                    board.translate_areas(new Set([index]), this.shift);
                }else {
                    return "Error: index not in areas";
                }
            } else if (kind == "ControlPoint"){
                if (board.graph.links.has(index)){
                    const link = board.graph.links.get(index);
                    if ( typeof link.cp != "string"){
                        link.cp.translate(this.shift);
                    }
                }else {
                    return "Error: index not in links";
                }
            } else if (kind == "Vertex"){
                if( board.graph.vertices.has(index)){
                    board.graph.translate_vertices([index], this.shift);
                } else {
                    return "Error: index not in vertices";
                }
            }
        }
        return new Set();
    }

    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        for (const [kind, index] of this.indices) {
            if (kind == "TextZone"){
                if (board.text_zones.has(index)){
                    board.text_zones.get(index).pos.rtranslate(this.shift);
                }
            } else if (kind == "Stroke"){
                if (board.strokes.has(index)){
                    board.strokes.get(index).rtranslate(this.shift);
                }
            } else if (kind == "Area"){
                if (board.areas.has(index)){
                    board.translate_areas(new Set([index]), this.shift.opposite());               
                }
            } else if (kind == "ControlPoint"){
                if (board.graph.links.has(index)){
                    const link = board.graph.links.get(index);
                    if ( typeof link.cp != "string"){
                        link.cp.rtranslate(this.shift);
                    }
                }
            } else if (kind == "Vertex"){
                if( board.graph.vertices.has(index)){
                    board.graph.translate_vertices([index], this.shift.opposite());
                }
            }
        }
        return new Set();
    }
}



export class GraphPaste implements BoardModification {
    added_vertices: Map<number, Vertex>;
    added_links: Map<number, Link>;

    constructor(added_vertices, added_links){
        this.added_vertices = added_vertices;
        this.added_links = added_links;
    }


    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        for ( const [vertex_index, vertex] of this.added_vertices.entries()){
            board.graph.vertices.set(vertex_index, vertex);
        }
        for ( const [link_index, link] of this.added_links.entries()){
            board.graph.links.set(link_index, link);
        }
        return new Set([SENSIBILITY.ELEMENT]);
    }


    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        for ( const vertex_index of this.added_vertices.keys()){
            board.graph.vertices.delete(vertex_index);
        }
        for ( const link_index of this.added_links.keys()){
            board.graph.links.delete(link_index);
        }
        return new Set([SENSIBILITY.ELEMENT])
    }
}


export class DeleteElements implements BoardModification {
    vertices: Map<number, Vertex>;
    links: Map<number, Link>;
    strokes: Map<number, Stroke>;
    areas: Map<number, Area>;
    text_zones: Map<number, TextZone>;

    constructor(vertices, links, strokes, areas, text_zones) {
        this.vertices = vertices;
        this.links = links;
        this.strokes = strokes;
        this.areas = areas;
        this.text_zones = text_zones;
    }

    static from_indices<V extends Vertex,L extends Link, S extends Stroke, A extends Area, T extends TextZone, R extends Representation>(board: ServerBoard, indices: Array<[string, number]>){
        const vertices = new Map();
        const links = new Map();
        const strokes = new Map();
        const areas = new Map();
        const text_zones = new Map();
        for (const [kind, index] of indices){
            if (kind == "Vertex"){
                vertices.set(index, board.graph.vertices.get(index));
                board.graph.links.forEach((link, link_index) => {
                    if (link.end_vertex === index || link.start_vertex === index) {
                        links.set(link_index, link);
                    }
                })
            } else if (kind == "Link"){
                links.set(index, board.graph.links.get(index));
            } else if (kind == "Stroke"){
                strokes.set(index, board.strokes.get(index));
            } else if (kind == "Area"){
                areas.set(index, board.areas.get(index));
            } else if (kind == "TextZone"){
                text_zones.set(index, board.text_zones.get(index));
            } else {
                return "Error: kind not supported " + kind
            }
        }
        return new DeleteElements(vertices, links, strokes, areas, text_zones);
    }

    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        for (const index of this.vertices.keys()) {
            board.graph.delete_vertex(index);
        }
        for (const index of this.links.keys()) {
            board.graph.delete_link(index);
        }
        for (const index of this.strokes.keys()) {
            board.delete_stroke(index);
        }
        for (const index of this.areas.keys()) {
            board.delete_area(index);
        }
        for (const index of this.text_zones.keys()){
            board.text_zones.delete(index);
        }
        // TODO set is false
        return new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC, SENSIBILITY.WEIGHT])
    }


    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        for (const [index, vertex] of this.vertices.entries()) {
            board.graph.vertices.set(index, vertex);
        }
        for (const [index, link] of this.links.entries()) {
            board.graph.links.set(index, link);
        }
        for (const [index, stroke] of this.strokes.entries()) {
            board.strokes.set(index, stroke);
        }
        for (const [index, area] of this.areas.entries()) {
            board.areas.set(index, area);
        }
        for (const [index, text_zone] of this.text_zones.entries()){
            board.text_zones.set(index, text_zone);
        }
        return new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC, SENSIBILITY.WEIGHT])
    }
}




export class AreaMoveCorner implements BoardModification {
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

    static from_area<V extends Vertex,L extends Link, S extends Stroke, A extends Area, T extends TextZone, R extends Representation>(index: number, area: A, x: number, y: number, corner_number: number): AreaMoveCorner {
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


    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        if (board.areas.has(this.index)){
            const area = board.areas.get(this.index);
            area.c1 = this.new_c1;
            area.c2 = this.new_c2;
            return new Set([]);
        } else {
            return "Error: index not in areas" + String(this.index);
        }
    }

    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        const area = board.areas.get(this.index);
        area.c1 = this.previous_c1;
        area.c2 = this.previous_c2;
        return new Set([]);
    }
}


export class VerticesMerge implements BoardModification {
    index_vertex_fixed: number;
    index_vertex_to_remove: number;
    vertex_to_remove: Vertex;
    deleted_links: Map<number, Link>;
    modified_links_indices: Array<number>;

    constructor(index_vertex_fixed: number, index_vertex_to_remove: number, vertex_to_remove: Vertex, deleted_links: Map<number, Link>, modified_links_indices: Array<number>) {
        this.index_vertex_fixed = index_vertex_fixed;
        this.index_vertex_to_remove = index_vertex_to_remove;
        this.vertex_to_remove = vertex_to_remove;
        this.deleted_links = deleted_links;
        this.modified_links_indices = modified_links_indices;
    }

    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        const v_fixed = board.graph.vertices.get(this.index_vertex_fixed);

        for (const link_index of this.deleted_links.keys()){
            board.graph.links.delete(link_index);
        }
        for (const link_index of this.modified_links_indices.values()){
            if (board.graph.links.has(link_index)){
                const link = board.graph.links.get(link_index);
                if ( link.start_vertex == this.index_vertex_to_remove){
                    link.start_vertex = this.index_vertex_fixed;
                    const fixed_end = board.graph.vertices.get(link.end_vertex);
                    link.transform_cp(v_fixed.pos, this.vertex_to_remove.pos, fixed_end.pos);
                } else if ( link.end_vertex == this.index_vertex_to_remove){
                    link.end_vertex = this.index_vertex_fixed;
                    const fixed_end = board.graph.vertices.get(link.start_vertex);
                    link.transform_cp(v_fixed.pos, this.vertex_to_remove.pos, fixed_end.pos);
                }
            }
        }
        board.graph.delete_vertex(this.index_vertex_to_remove);
        return new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC, SENSIBILITY.WEIGHT])
    }

    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        const v_fixed = board.graph.vertices.get(this.index_vertex_fixed);

        board.graph.vertices.set(this.index_vertex_to_remove, this.vertex_to_remove);
        for (const [link_index, link] of this.deleted_links.entries()) {
            board.graph.links.set(link_index, link);
        }
        for (const link_index of this.modified_links_indices.values()) {
            if ( board.graph.links.has(link_index)){
                const link = board.graph.links.get(link_index);
                if (link.start_vertex == this.index_vertex_fixed){
                    link.start_vertex = this.index_vertex_to_remove;
                    const fixed_end = board.graph.vertices.get(link.end_vertex);
                    link.transform_cp(this.vertex_to_remove.pos, v_fixed.pos, fixed_end.pos);
                } else if (link.end_vertex == this.index_vertex_fixed ){
                    link.end_vertex = this.index_vertex_to_remove;
                    const fixed_end = board.graph.vertices.get(link.start_vertex);
                    link.transform_cp(this.vertex_to_remove.pos, v_fixed.pos, fixed_end.pos);
                }
            }
        }
        return new Set([]);
    }

    // does not modify the graph
    // any link between fixed and remove are deleted
    // any link such that one of its endpoints is "remove", is either deleted either modified
    static from_graph<V extends Vertex,L extends Link, S extends Stroke, A extends Area, T extends TextZone, R extends Representation>(graph: Graph<Vertex,Link>, vertex_index_fixed: number, vertex_index_to_remove: number ): VerticesMerge{
        const v_to_remove = graph.vertices.get(vertex_index_to_remove);
        const deleted_links = new Map();
        const modified_links_indices = new Array();

        for ( const [link_index, link] of graph.links.entries()) {
            const endpoints = new Set([link.start_vertex, link.end_vertex]);
            if ( eqSet(endpoints, new Set([vertex_index_fixed, vertex_index_to_remove])) ){
                deleted_links.set(link_index, link);
            } else if (link.end_vertex == vertex_index_to_remove) {
                let is_deleted = false;
                for (const [index2, link2] of graph.links.entries()) {
                    if ( index2 != link_index && link2.signature_equals(link.start_vertex, vertex_index_fixed, link.orientation )){
                        deleted_links.set(link_index, link);
                        is_deleted = true;
                        break;
                    }
                }
                if ( is_deleted == false ){
                    modified_links_indices.push(link_index);
                }
            } else if (link.start_vertex == vertex_index_to_remove) {
                let is_deleted = false;
                for (const [index2, link2] of graph.links.entries()) {
                    if ( index2 != link_index && link2.signature_equals(vertex_index_fixed, link.end_vertex, link.orientation)){
                        deleted_links.set(link_index, link);
                        is_deleted = true;
                        break;
                    }
                }
                if ( is_deleted == false ){
                    modified_links_indices.push(link_index);
                }
            }
        }

        return new VerticesMerge(vertex_index_fixed, vertex_index_to_remove, v_to_remove, deleted_links, modified_links_indices);
    }
}



export class AreaMoveSide implements BoardModification {
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

    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        if (board.areas.has(this.index)){
            const area = board.areas.get(this.index);
            area.c1 = this.new_c1;
            area.c2 = this.new_c2;
            return new Set([]);
        } else {
            return "Error: index not in areas" + String(this.index);
        }
    }

    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        const area = board.areas.get(this.index);
        area.c1 = this.previous_c1;
        area.c2 = this.previous_c2;
        return new Set([]);
    }

    static from_area<V extends Vertex,L extends Link, S extends Stroke, A extends Area, T extends TextZone, R extends Representation>(index: number, area: Area, x: number, y: number, side_number: number): AreaMoveSide{
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