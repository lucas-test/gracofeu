import { ClientArea, AREA_CORNER, AREA_SIDE } from "./area";
import { INDEX_TYPE, View } from "./camera";
import { DOWN_TYPE } from "../interactors/interactor";
import { ClientStroke } from "./stroke";
import { CanvasCoord, ClientVertex } from "./vertex";
import { ClientLink } from "./link";
import { Graph, Link, middle, ORIENTATION } from "gramoloss";
import { CanvasVect } from "./vect";




export class ClientGraph extends Graph<ClientVertex, ClientLink, ClientStroke, ClientArea> {
 
    constructor() {
        super();
    }


    translate_by_canvas_vect(shift: CanvasVect, view: View){
        for ( const vertex of this.vertices.values()){
            vertex.translate_by_canvas_vect(shift, view);
        }
        for ( const link of this.links.values()){
            link.translate_cp_by_canvas_vect(shift, view);
        }
    }




    deselect_all_vertices() {
        this.vertices.forEach(vertex => {
            vertex.is_selected = false;
        });
    }

    deselect_all_links() {
        this.links.forEach(link => {
            link.is_selected = false;
        });
    } 
    
    deselect_all_strokes() {
        this.strokes.forEach(s => {
            s.is_selected = false;
        });
    }

    clear_all_selections() {
        this.deselect_all_vertices();
        this.deselect_all_links();
        this.deselect_all_strokes();
    }

    

    get_vertex_index_nearby(pos: CanvasCoord) {
        for (let index of this.vertices.keys()) {
            let v = this.vertices.get(index);
            if (v.is_nearby(pos, 150)) {
                return index;
            }
        }
        return null;
    }


    select_vertices_in_rect(corner1: CanvasCoord, corner2: CanvasCoord) {
        for (const vertex of this.vertices.values()) {
            if (vertex.is_in_rect(corner1, corner2)) {
                vertex.is_selected = true;
            }
        }
    }

    select_links_in_rect(corner1: CanvasCoord, corner2: CanvasCoord) {
        for (const index of this.links.keys()) {
            const link = this.links.get(index);
            if (link.is_in_rect(corner1, corner2)) {
                link.is_selected = true;
            }
        }
    }

    is_click_over_link(link_index: number, e: CanvasCoord, view: View) {
        const link = this.links.get(link_index);
        const v = this.vertices.get(link.start_vertex)
        const w = this.vertices.get(link.end_vertex)
        const linkcp_canvas = link.cp_canvas_pos;
        const v_canvas_pos = v.canvas_pos;
        const w_canvas_pos = w.canvas_pos
        if (typeof linkcp_canvas != "string"){
            return e.is_nearby_beziers_1cp(v_canvas_pos, linkcp_canvas, w_canvas_pos);
        }
        else {
            // OPT dont need beziers as it is a straight line
            const middle = v_canvas_pos.middle(w_canvas_pos);
            return e.is_nearby_beziers_1cp(v_canvas_pos, middle, w_canvas_pos);
        }
    }

    compute_vertices_index_string(view: View) {
        const letters = "abcdefghijklmnopqrstuvwxyz";
        this.vertices.forEach((vertex, index) => {
            if (view.index_type == INDEX_TYPE.NONE) {
                vertex.index_string = "";
            } else if (view.index_type == INDEX_TYPE.NUMBER_STABLE) {
                vertex.index_string = "v" + String(index)
            } else if (view.index_type == INDEX_TYPE.ALPHA_STABLE) {
                vertex.index_string = letters.charAt(index % letters.length);
            }
            else if (view.index_type == INDEX_TYPE.NUMBER_UNSTABLE) {
                let counter = 0;
                for (const key of this.vertices.keys()) {
                    if (key < index) {
                        counter++;
                    }
                }
                vertex.index_string = "v" + String(counter)
            }
            else if (view.index_type == INDEX_TYPE.ALPHA_UNSTABLE) {
                let counter = 0;
                for (const key of this.vertices.keys()) {
                    if (key < index) {
                        counter++;
                    }
                }
                vertex.index_string = letters.charAt(counter % letters.length);
            }
        })
    }

    // align_position
    // return a CanvasCoord near mouse_canvas_coord which aligned on other vertices or on the grid
    align_position(pos_to_align: CanvasCoord, excluded_indices: Set<number>, canvas: HTMLCanvasElement, view: View): CanvasCoord {
        const aligned_pos = new CanvasCoord(pos_to_align.x, pos_to_align.y);
        if (view.is_aligning) {
            view.alignement_horizontal = false;
            view.alignement_vertical = false;
            this.vertices.forEach((vertex: ClientVertex, index) => {
                if (excluded_indices.has(index) == false) {
                    if (Math.abs(vertex.canvas_pos.y - pos_to_align.y) <= 15) {
                        aligned_pos.y = vertex.canvas_pos.y;
                        view.alignement_horizontal = true;
                        view.alignement_horizontal_y = view.canvasCoordY(vertex.pos);
                        return;
                    }
                    if (Math.abs(vertex.canvas_pos.x - pos_to_align.x) <= 15) {
                        aligned_pos.x = vertex.canvas_pos.x;
                        view.alignement_vertical = true;
                        view.alignement_vertical_x = view.canvasCoordX(vertex.pos);
                        return;
                    }
                }
            })
        }
        if (view.grid_show) {
            const grid_size = view.grid_size;
            for (let x = view.camera.x % grid_size; x < canvas.width; x += grid_size) {
                if (Math.abs(x - pos_to_align.x) <= 15) {
                    aligned_pos.x = x;
                    break;
                }
            }
            for (let y = view.camera.y % grid_size; y < canvas.height; y += grid_size) {
                if (Math.abs(y - pos_to_align.y) <= 15) {
                    aligned_pos.y = y;
                    break;
                }
            }
        }
        return aligned_pos;
    }

    get_selected_vertices(): Set<number> {
        const set = new Set<number>();
        this.vertices.forEach((v, index) => {
            if (v.is_selected) {
                set.add(index);
            }
        })
        return set;
    }

    update_canvas_pos(view: View) {
        for (const v of this.vertices.values()) {
            v.update_after_view_modification(view);
        }
        for (const link of this.links.values()) {
            link.update_after_view_modification(view);
        }
        for (const area of this.areas.values()){
            area.update_canvas_pos(view);
        }
        for( const stroke of this.strokes.values()){
            stroke.update_canvas_pos(view);
        }
        this.set_automatic_weight_positions();
        
    }


    get_induced_subgraph_from_selection(view: View): ClientGraph{
        const subgraph = new ClientGraph();
        for (const [index, v] of this.vertices.entries()) {
            if(v.is_selected){
                const new_vertex = new ClientVertex(v.pos.x, v.pos.y, v.weight, view);
                subgraph.vertices.set(index, new_vertex);
            }
        }

        for (const [index, e] of this.links.entries()){
            const u = this.vertices.get(e.start_vertex);
            const v = this.vertices.get(e.end_vertex);
            if(u.is_selected && v.is_selected){
                const new_link = new ClientLink(e.start_vertex, e.end_vertex, e.cp, e.orientation, e.color, e.weight, view)
                subgraph.links.set(index, new_link);
            }
        }
        return subgraph;
    }

    translate_area(shift: CanvasVect, area_index: number, vertices_contained: Set<number>, view: View){
        if( this.areas.has(area_index)){
            const area = this.areas.get(area_index);
            this.vertices.forEach((vertex, vertex_index) => {
                if (vertices_contained.has(vertex_index)){
                    vertex.translate_by_canvas_vect(shift, view);
                }
            })
            for( const link of this.links.values()){
                if ( typeof link.cp != "string"){
                    const v1 = this.vertices.get(link.start_vertex);
                    const v2 = this.vertices.get(link.end_vertex);
                    if(vertices_contained.has(link.start_vertex) && vertices_contained.has(link.end_vertex)){
                        link.translate_cp_by_canvas_vect(shift, view);
                    }
                    else if(vertices_contained.has(link.start_vertex)){ // and thus not v2
                        const new_pos = v1.pos;
                        const previous_pos = view.create_server_coord_from_subtranslated(v1.canvas_pos, shift);
                        const fixed_pos = v2.pos;
                        link.transform_cp(new_pos, previous_pos, fixed_pos);
                        link.cp_canvas_pos = view.create_canvas_coord(link.cp);
                    }else if(vertices_contained.has(link.end_vertex)) { // and thus not v1
                        const new_pos = v2.pos;
                        const previous_pos = view.create_server_coord_from_subtranslated(v2.canvas_pos, shift);
                        const fixed_pos = v1.pos;
                        link.transform_cp(new_pos, previous_pos, fixed_pos);
                        link.cp_canvas_pos = view.create_canvas_coord(link.cp);
                    }
                }
            }
            area.translate_by_canvas_vect(shift, view);
            
        }
    }

    automatic_weight_position(link_index: number){
        const link = this.links.get(link_index);
        if ( link.weight_div != null){
            const u = this.vertices.get(link.start_vertex);
            const v = this.vertices.get(link.end_vertex);
    
            const posu = u.canvas_pos; 
            const posv = v.canvas_pos; 
            let middle = posu.middle(posv);
            if (typeof link.cp_canvas_pos != "string"){
                middle = link.cp_canvas_pos;
            }
            link.weight_position = middle.add(posu.sub(posv).normalize().rotate_quarter().scale(14));
            link.weight_div.style.top = String(link.weight_position.y - link.weight_div.clientHeight/2) + "px";
            link.weight_div.style.left = String(link.weight_position.x- link.weight_div.clientWidth/2) + "px";
        }
    }

    automatic_link_weight_position_from_vertex(vertex_index: number){
        for( const [link_index, link] of this.links.entries()){
            if( link.start_vertex == vertex_index || link.end_vertex == vertex_index){
                this.automatic_weight_position(link_index);
            }
        }
    }

    set_automatic_weight_positions(){
        for ( const link_index of this.links.keys()){
            this.automatic_weight_position(link_index);
        }
    } 

    clear_vertices(){
        for( const vertex of this.vertices.values()){
            if (vertex.weight_div != null){
                vertex.weight_div.remove();
            }
        }
        this.vertices.clear();
    }

    clear_links(){
        for( const link of this.links.values()){
            if (link.weight_div != null){
                link.weight_div.remove();
            }
        }
        this.links.clear();
    }

    add_default_client_vertex(x: number, y: number, view: View){
        const v = new ClientVertex(x,y,"", view);
        this.add_vertex(v);
    }

    add_edge(index1: number, index2: number, view: View ){
        const v1 = this.vertices.get(index1);
        const v2 = this.vertices.get(index2);
        const cp = middle(v1.pos, v2.pos);
        const link = new ClientLink(index1, index2, cp, ORIENTATION.UNDIRECTED, "black", "", view);
        this.add_link(link);
    }

    translate_vertex_by_canvas_vect(index: number, cshift: CanvasVect, view: View){
        if (this.vertices.has(index)) {
            const vertex = this.vertices.get(index);
            const previous_pos = vertex.pos.copy();
            vertex.translate_by_canvas_vect(cshift, view);
            const new_pos = vertex.pos.copy();

            for (const [link_index, link] of this.links.entries()) {
                if ( typeof link.cp != "string"){
                    if (link.start_vertex == index) {
                        const end_vertex_pos = this.vertices.get(link.end_vertex).pos;
                        link.transform_cp(new_pos, previous_pos, end_vertex_pos);
                        link.cp_canvas_pos = view.create_canvas_coord(link.cp);
                    } else if (link.end_vertex == index) {
                        const start_vertex_pos = this.vertices.get(link.start_vertex).pos;
                        link.transform_cp(new_pos, previous_pos, start_vertex_pos);
                        link.cp_canvas_pos = view.create_canvas_coord(link.cp);
                    }
                }
            }
        }
    }
}







