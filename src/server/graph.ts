
import { Link, ORIENTATION } from './link';
import { Vertex } from './vertex';

import { Coord, middle } from './coord';
import { Stroke } from './stroke';
import { Area } from './area';
import { AddArea, AddLink, AddStroke, AddVertex, DeleteElements, Modification, TranslateAreas, TranslateControlPoints, TranslateStrokes, TranslateVertices, UpdateColors, UpdateLinkWeight, UpdateSeveralVertexPos } from './modifications';


export enum SENSIBILITY {
    GEOMETRIC = "GEOMETRIC", // Move of vertex/link
    COLOR = "COLOR", // Change of color for vertices/links
    ELEMENT = "ELEMENT", // Create/delete vertex/link
    WEIGHT = "WEIGHT"
}

// decide if there is equality between two sets xs and ys
const eqSet = (xs: Set<number>, ys: Set<number>) =>
    xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));


export class Graph {
    vertices: Map<number, Vertex>;
    links: Map<number, Link>;
    strokes: Map<number, Stroke>;
    areas:Map<number, Area>;
    modifications_heap: Array<Modification> = new Array();
    modifications_undoed: Array<Modification> = new Array();


    constructor() {
        this.vertices = new Map();
        this.links = new Map();
        this.strokes = new Map();
        this.areas = new Map();
    }

    add_modification(modif: Modification){
        console.log("add_mofication");
        const length = this.modifications_heap.length;
        if ( length > 0){
            const last_modif = this.modifications_heap[length-1];
            if ( last_modif.constructor == TranslateVertices && modif.constructor == TranslateVertices ) {
                if( eqSet((<TranslateVertices>modif).indices,(<TranslateVertices>last_modif).indices ) ){
                    this.modifications_heap.pop();
                    (<TranslateVertices>modif).shift.translate( (<TranslateVertices>last_modif).shift);
                }
            }
            if ( last_modif.constructor == TranslateControlPoints && modif.constructor == TranslateControlPoints ) {
                if( eqSet((<TranslateControlPoints>modif).indices,(<TranslateControlPoints>last_modif).indices ) ){
                    this.modifications_heap.pop();
                    (<TranslateControlPoints>modif).shift.translate( (<TranslateControlPoints>last_modif).shift);
                }
            }
        }
        this.modifications_heap.push(modif);
        console.log(this.modifications_heap);
    }

    try_implement_modification(modif: Modification) : Set<SENSIBILITY>{
        switch (modif.constructor){
            case AddVertex:
                this.set_vertex((<AddVertex>modif).index, (<AddVertex>modif).x, (<AddVertex>modif).y);
                this.add_modification(modif);
                return new Set([SENSIBILITY.ELEMENT]);
            case AddLink:
                this.set_link((<AddLink>modif).index, (<AddLink>modif).start_index, (<AddLink>modif).end_index, (<AddLink>modif).orientation)
                this.add_modification(modif);
                return new Set([SENSIBILITY.ELEMENT]);
            case UpdateLinkWeight:
                this.update_link_weight((<UpdateLinkWeight>modif).index, (<UpdateLinkWeight>modif).new_weight);
                this.add_modification(modif);
                return new Set([SENSIBILITY.WEIGHT]);
            case TranslateVertices:
                this.translate_vertices((<TranslateVertices>modif).indices, (<TranslateVertices>modif).shift );
                this.add_modification(modif);
                return new Set([SENSIBILITY.GEOMETRIC]);
            case TranslateControlPoints:
                    for( const index of (<TranslateControlPoints>modif).indices){
                        if ( this.links.has(index)){
                            const link = this.links.get(index);
                            link.cp.translate((<TranslateControlPoints>modif).shift);
                        }
                    }
                    this.add_modification(modif);
                    return new Set([SENSIBILITY.GEOMETRIC]);
            case TranslateStrokes:
                for( const index of (<TranslateStrokes>modif).indices){
                    if ( this.strokes.has(index)){
                        const stroke = this.strokes.get(index);
                        stroke.translate((<TranslateStrokes>modif).shift);
                    }
                }
                this.add_modification(modif);
                return new Set([]);
            case TranslateAreas:
                this.translate_areas( (<TranslateAreas>modif).indices , (<TranslateAreas>modif).shift)
                this.add_modification(modif);
                return new Set([SENSIBILITY.GEOMETRIC]);
            case UpdateColors:
                for(const color_modif of (<UpdateColors>modif).data){
                    switch(color_modif.type){
                        case "vertex":
                            if( this.vertices.has(color_modif.index)){
                                this.vertices.get(color_modif.index).color = color_modif.new_color;
                            }
                            break;
                        case "link":
                            if( this.links.has(color_modif.index)){
                                this.links.get(color_modif.index).color = color_modif.new_color;
                            }
                            break;
                        case "stroke":
                            if( this.strokes.has(color_modif.index)){
                                this.strokes.get(color_modif.index).color = color_modif.new_color;
                            }
                            break;
                    }
                    this.add_modification(modif);
                    return new Set([SENSIBILITY.COLOR]);
                }
            case AddStroke:
                this.strokes.set((<AddStroke>modif).index, (<AddStroke>modif).stroke);
                this.add_modification(modif);
                return new Set([]);
            case AddArea:
                this.areas.set((<AddArea>modif).index, (<AddArea>modif).area);
                this.add_modification(modif);
                return new Set([]);
            case DeleteElements:
                for ( const index of (<DeleteElements>modif).vertices.keys()){
                    this.delete_vertex(index);
                }
                for ( const index of (<DeleteElements>modif).links.keys()){
                    this.delete_link(index);
                }
                for ( const index of (<DeleteElements>modif).strokes.keys()){
                    this.delete_stroke(index);
                }
                for ( const index of (<DeleteElements>modif).areas.keys()){
                    this.delete_area(index);
                }
                this.add_modification(modif);
                return new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC, SENSIBILITY.WEIGHT])
        }
        console.log("try_implement_modififcation: no method found for ", modif.constructor);
        return new Set([]);
    }

    try_implement_new_modification(modif: Modification) : Set<SENSIBILITY>{
        const sensibilities = this.try_implement_modification(modif);
        this.modifications_undoed.length = 0;
        return sensibilities;
    }

    reverse_last_modification() : Set<SENSIBILITY>{
        if ( this.modifications_heap.length > 0 ){
            const last_modif = this.modifications_heap.pop();
            switch (last_modif.constructor){
                case AddVertex:
                    this.delete_vertex((<AddVertex>last_modif).index);
                    this.modifications_undoed.push(last_modif);
                    return new Set([SENSIBILITY.ELEMENT]);
                case AddLink:
                    this.delete_link((<AddLink>last_modif).index);
                    this.modifications_undoed.push(last_modif);
                    return new Set([SENSIBILITY.ELEMENT]);
                case UpdateLinkWeight:
                    this.update_link_weight((<UpdateLinkWeight>last_modif).index, (<UpdateLinkWeight>last_modif).previous_weight);
                    this.modifications_undoed.push(last_modif);
                    return new Set([SENSIBILITY.WEIGHT]);
                case UpdateSeveralVertexPos:
                    const previous_positions = (<UpdateSeveralVertexPos>last_modif).previous_positions;
                    for ( const [vertex_index, previous_pos] of previous_positions.entries()){
                        this.update_vertex_pos(vertex_index, previous_pos);
                    }
                    this.modifications_undoed.push(last_modif);
                    return new Set([SENSIBILITY.GEOMETRIC]);
                case TranslateVertices:
                    this.translate_vertices((<TranslateVertices>last_modif).indices, (<TranslateVertices>last_modif).shift.opposite() );
                    this.modifications_undoed.push(last_modif);
                    return new Set([SENSIBILITY.GEOMETRIC]);
                case TranslateAreas:
                    this.translate_areas((<TranslateAreas>last_modif).indices, (<TranslateAreas>last_modif).shift.opposite() );
                    this.modifications_undoed.push(last_modif);
                    return new Set([SENSIBILITY.GEOMETRIC]);
                case TranslateControlPoints:
                        for( const index of (<TranslateControlPoints>last_modif).indices){
                            if ( this.links.has(index)){
                                const link = this.links.get(index);
                                link.cp.rtranslate((<TranslateControlPoints>last_modif).shift);
                            }
                        }
                        this.modifications_undoed.push(last_modif);
                        return new Set([SENSIBILITY.GEOMETRIC]);
                case TranslateStrokes:
                    for( const index of (<TranslateControlPoints>last_modif).indices){
                        if ( this.strokes.has(index)){
                            const stroke = this.strokes.get(index);
                            stroke.rtranslate((<TranslateControlPoints>last_modif).shift);
                        }
                    }
                    this.modifications_undoed.push(last_modif);
                    return new Set([]);
                    case UpdateColors:
                        for(const color_modif of (<UpdateColors>last_modif).data){
                            switch(color_modif.type){
                                case "vertex":
                                    if( this.vertices.has(color_modif.index)){
                                        this.vertices.get(color_modif.index).color = color_modif.previous_color;
                                    }
                                    break;
                                case "link":
                                    if( this.links.has(color_modif.index)){
                                        this.links.get(color_modif.index).color = color_modif.previous_color;
                                    }
                                    break;
                                case "stroke":
                                    if( this.strokes.has(color_modif.index)){
                                        this.strokes.get(color_modif.index).color = color_modif.previous_color;
                                    }
                                    break;
                            }
                            this.modifications_undoed.push(last_modif);
                            return new Set([SENSIBILITY.COLOR]);
                        }
                    case AddStroke:
                        this.delete_stroke((<AddStroke>last_modif).index);
                        this.modifications_undoed.push(last_modif);
                        return new Set([]);
                    case AddArea:
                        this.delete_area((<AddArea>last_modif).index);
                        this.modifications_undoed.push(last_modif);
                        return new Set([]);
                    case DeleteElements:
                        for ( const [index, vertex] of (<DeleteElements>last_modif).vertices.entries()){
                            this.vertices.set(index, vertex);
                        }
                        for ( const [index, link] of (<DeleteElements>last_modif).links.entries()){
                            this.links.set(index, link);
                        }
                        for ( const [index, stroke] of (<DeleteElements>last_modif).strokes.entries()){
                            this.strokes.set(index, stroke);
                        }
                        for ( const [index, area] of (<DeleteElements>last_modif).areas.entries()){
                            this.areas.set(index, area);
                        }
                        this.modifications_undoed.push(last_modif);
                        return new Set([]);
                
            }
                console.log("reverse_modification: no method found for ", last_modif.constructor);
                return new Set([]);
        }else {
            return new Set([]);
        }
    }

    redo(): Set<SENSIBILITY> {
        console.log(this.modifications_undoed);
        if ( this.modifications_undoed.length > 0){
            const modif = this.modifications_undoed.pop();
            return this.try_implement_modification(modif);
        }
        return new Set();
    }

    update_link_weight(link_index: number, new_weight: string){
        if( this.links.has(link_index)){
            this.links.get(link_index).weight = new_weight;
        }
    }

    update_vertex_pos(vertex_index: number, new_pos: Coord){
        this.vertices.get(vertex_index).pos = new_pos;
    }

    update_control_point(link_index: number, new_pos: Coord){
        this.links.get(link_index).cp = new_pos;
    }


    get_next_available_index() {
        let index = 0;
        while (this.vertices.has(index)) {
            index += 1;
        }
        return index;
    }

    get_next_available_index_links() {
        let index = 0;
        while (this.links.has(index)) {
            index += 1;
        }
        return index;
    }

    get_next_available_index_strokes(){
        let index = 0;
        while (this.strokes.has(index)) {
            index += 1;
        }
        return index;
    }

    get_next_available_index_area() {
        let index = 0;
        while (this.areas.has(index)) {
            index += 1;
        }
        return index;
    }


    get_index(v: Vertex) {
        for (let [index, vertex] of this.vertices.entries()) {
            if (vertex === v) {
                return index;
            }
        }
        return;
    }



    add_vertex(x: number, y: number) {
        let index = this.get_next_available_index();
        this.vertices.set(index, new Vertex(x, y));
        return index;
    }

    set_vertex(index: number, x: number, y: number){
        this.vertices.set(index, new Vertex(x,y));
    }

    check_link(i: number, j: number, orientation: ORIENTATION): boolean{
        // do not add link if it is a loop (NO LOOP)
        if ( i == j ){
            return false;
        }

        // do not add link if it was already existing (NO MULTIEDGE)
        for (const link of this.links.values()) {
            if (link.orientation == orientation) {
                if (orientation == ORIENTATION.UNDIRECTED) {
                    if ((link.start_vertex == i && link.end_vertex == j) || (link.start_vertex == j && link.end_vertex == i)) {
                        return false;
                    }
                }
                else if (orientation == ORIENTATION.DIRECTED) {
                    if (link.start_vertex == i && link.end_vertex == j) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    add_link(i: number, j: number, orientation: ORIENTATION) {
        if ( this.check_link(i,j,orientation) == false){
            return;
        }
        const index = this.get_next_available_index_links();
        const v1 = this.vertices.get(i);
        const v2 = this.vertices.get(j);
        this.links.set(index, new Link(i, j, middle(v1.pos, v2.pos), orientation, "black"));
        return index;
    }

    set_link(link_index: number, start_index: number, end_index: number, orientation: ORIENTATION){
        if ( this.check_link(start_index,end_index,orientation) == false){
            return;
        }
        const v1 = this.vertices.get(start_index);
        const v2 = this.vertices.get(end_index);
        this.links.set(link_index, new Link(start_index, end_index, middle(v1.pos, v2.pos), orientation, "black"));
    }


    add_link_with_cp(i: number, j: number, orientation: ORIENTATION, cp: Coord) {
        const index = this.add_link(i, j, orientation);
        const link = this.links.get(index);
        link.cp.copy_from(cp);
    }




    add_stroke(positions_data:any, color:string, width:number, top_left_data:any, bot_right_data:any) {
        // console.log(positions_data, old_pos_data, color, width, top_left_data, bot_right_data);
        const index = this.get_next_available_index_strokes();
        const positions = [];
        positions_data.forEach(e => {
            // console.log(e);
            positions.push(new Coord(e[1].x, e[1].y));
        });
        const top_left = new Coord(top_left_data.x, top_left_data.y);
        const bot_right = new Coord(bot_right_data.x, bot_right_data.y);

        this.strokes.set(index, new Stroke(positions, color, width, top_left, bot_right));
    }



    get_neighbors_list(i: number) {
        let neighbors = new Array<number>();
        for (let e of this.links.values()) {
            if (e.orientation == ORIENTATION.UNDIRECTED) {
                if (e.start_vertex == i) {
                    neighbors.push(e.end_vertex);
                } else if (e.end_vertex == i) {
                    neighbors.push(e.start_vertex);
                }
            }
        }
        return neighbors;
    }

    delete_vertex(vertex_index: number) {
        this.vertices.delete(vertex_index);

        this.links.forEach((link, link_index) => {
            if (link.end_vertex === vertex_index || link.start_vertex === vertex_index) {
                this.links.delete(link_index);
            }
        })
    }

    delete_link(link_index: number) {
        this.links.delete(link_index);
    }

    
    delete_stroke(stroke_index: number) {
        this.strokes.delete(stroke_index);
    }

    delete_area(area_index: number) {
        this.areas.delete(area_index);
    }

    clear() {
        this.vertices.clear();
        this.links.clear();
    }


    vertices_merge(vertex_index_fixed: number, vertex_index_to_remove: number){

        this.links.forEach((link, link_index) => {
            if (link.end_vertex == vertex_index_to_remove) {
                this.add_link(link.start_vertex, vertex_index_fixed, link.orientation);
            }
            if (link.start_vertex == vertex_index_to_remove) {
                this.add_link(vertex_index_fixed, link.end_vertex, link.orientation);
            }
        })

        this.delete_vertex(vertex_index_to_remove);
    }

    translate_areas(indices: Set<number>, shift: Coord){
        const contained_vertices = new Set<number>();
        for( const area_index of indices.values()){
            const area = this.areas.get(area_index);
            for (const [vertex_index, vertex] of this.vertices.entries()){
                if (area.is_containing(vertex)){
                    contained_vertices.add(vertex_index);
                }
            }
            area.translate(shift);  
        }
        this.translate_vertices(contained_vertices, shift);
    }

    translate_vertices(indices: Set<number>, shift: Coord){
        for( const index of indices){
            if ( this.vertices.has(index)){
                const vertex = this.vertices.get(index);
                const previous_pos = vertex.pos.copy();
                vertex.pos.translate(shift);
                const new_pos = vertex.pos.copy();

                for (const [link_index, link] of this.links.entries()) {
                    if ( link.start_vertex ==index){
                        const end_vertex_pos = this.vertices.get(link.end_vertex).pos;
                        link.transform_cp(new_pos, previous_pos, end_vertex_pos );
                    } else if (link.end_vertex == index ){
                        const start_vertex_pos = this.vertices.get(link.start_vertex).pos;
                        link.transform_cp(new_pos, previous_pos, start_vertex_pos );
                    }
                }
            }
        }
    }

}


