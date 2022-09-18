import { Area, AREA_CORNER, AREA_SIDE } from "./area";
import { INDEX_TYPE } from "./camera";
import { CanvasCoord, middle, ServerCoord } from "./coord";
import { DOWN_TYPE } from "../interactors/interactor";
import { Stroke } from "./stroke";
import { local_board } from "../setup";
import { LocalVertex } from "./vertex";
import { Link, ORIENTATION } from "./link";




export class Graph {
    vertices: Map<number, LocalVertex>;
    links: Map<number, Link>;
    strokes: Map<number, Stroke>;
    areas: Map<number, Area>;

    constructor() {
        this.vertices = new Map();
        this.links = new Map();
        this.strokes = new Map();
        this.areas = new Map();
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

    add_vertex(x: number, y: number) {
        let index = this.get_next_available_index();
        this.vertices.set(index, new LocalVertex( new ServerCoord(x, y)));
        return index;
    }

    add_edge(i: number, j: number) {
        // do not add link if it is a loop (NO LOOP)
        if ( i == j ){
            return;
        }

        // do not add link if it was already existing (NO MULTIEDGE)
        for (const link of this.links.values()) {
            if (link.orientation == ORIENTATION.UNDIRECTED) {
                    if ((link.start_vertex == i && link.end_vertex == j) || (link.start_vertex == j && link.end_vertex == i)) {
                        return;
                    }
            }
        }

        const index = this.get_next_available_index_links();
        const v1 = this.vertices.get(i);
        const v2 = this.vertices.get(j);
        const new_link = new Link(i, j, middle(v1.pos, v2.pos), ORIENTATION.UNDIRECTED, "black")
        this.links.set(index, new_link);
        return index;
    }

    translate(shift: CanvasCoord){
        for ( const vertex of this.vertices.values()){
            vertex.translate(shift, local_board.view);
        }
        for ( const link of this.links.values()){
            link.translate_cp(shift, local_board.view);
        }
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

    get_element_nearby(pos: CanvasCoord, interactable_element_type: Set<DOWN_TYPE>) {
        if (interactable_element_type.has(DOWN_TYPE.VERTEX)) {
            for (const [index, v] of this.vertices.entries()) {
                if (v.is_nearby(pos, 150)) {
                    return { type: DOWN_TYPE.VERTEX, index: index };
                }
            }
        }
       
        for (const [index, link] of this.links.entries()) {
            if (interactable_element_type.has(DOWN_TYPE.CONTROL_POINT) && link.cp.canvas_pos.is_nearby(pos, 150)) {
                return { type: DOWN_TYPE.CONTROL_POINT, index: index };
            }
            if (interactable_element_type.has(DOWN_TYPE.LINK) && this.is_click_over_link(index, pos)) {
                return { type: DOWN_TYPE.LINK, index: index };
            }
            if( interactable_element_type.has(DOWN_TYPE.LINK_WEIGHT) && pos.dist2(link.weight_position) <= 100){
                return { type: DOWN_TYPE.LINK_WEIGHT, index: index};
            }
        }

        for(const [index,a] of this.areas.entries()){
            if(interactable_element_type.has(DOWN_TYPE.AREA) && a.is_nearby(pos)){
                return{ type: DOWN_TYPE.AREA, index: index };
            }
            const corner_index = a.is_nearby_corner(pos);
            console.log("CORNER INDEX", corner_index, corner_index!=0);
            if(interactable_element_type.has(DOWN_TYPE.AREA_CORNER) && corner_index != AREA_CORNER.NONE){
                return{ type: DOWN_TYPE.AREA_CORNER, index: index, corner: corner_index };
            }

            const side_index = a.is_nearby_side(pos, 5);
            if(interactable_element_type.has(DOWN_TYPE.AREA_SIDE) && side_index != AREA_SIDE.NONE){
                 return{ type: DOWN_TYPE.AREA_SIDE, index: index, side: side_index };
             }
        }

        if (interactable_element_type.has(DOWN_TYPE.STROKE)) {
            for(const [index,s] of this.strokes.entries()){
                if(typeof s.is_nearby(pos) == "number"){     
                    return { type: DOWN_TYPE.STROKE, index: index };
                }
            }
        }

        return { type: DOWN_TYPE.EMPTY, index: null };
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

    is_click_over_link(link_index: number, e: CanvasCoord) {
        const link = this.links.get(link_index);
        const v = this.vertices.get(link.start_vertex)
        const w = this.vertices.get(link.end_vertex)
        const linkcp_canvas = local_board.view.canvasCoord(link.cp);
        const v_canvas_pos = v.pos.canvas_pos;
        const w_canvas_pos = w.pos.canvas_pos
        return e.is_nearby_beziers_1cp(v_canvas_pos, linkcp_canvas, w_canvas_pos);
    }

    compute_vertices_index_string() {
        const letters = "abcdefghijklmnopqrstuvwxyz";
        this.vertices.forEach((vertex, index) => {
            if (local_board.view.index_type == INDEX_TYPE.NONE) {
                vertex.index_string = "";
            } else if (local_board.view.index_type == INDEX_TYPE.NUMBER_STABLE) {
                vertex.index_string = "v" + String(index)
            } else if (local_board.view.index_type == INDEX_TYPE.ALPHA_STABLE) {
                vertex.index_string = letters.charAt(index % letters.length);
            }
            else if (local_board.view.index_type == INDEX_TYPE.NUMBER_UNSTABLE) {
                let counter = 0;
                for (const key of this.vertices.keys()) {
                    if (key < index) {
                        counter++;
                    }
                }
                vertex.index_string = "v" + String(counter)
            }
            else if (local_board.view.index_type == INDEX_TYPE.ALPHA_UNSTABLE) {
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
    align_position(pos_to_align: CanvasCoord, excluded_indices: Set<number>, canvas: HTMLCanvasElement) {
        const aligned_pos = new CanvasCoord(pos_to_align.x, pos_to_align.y);
        if (local_board.view.is_aligning) {
            local_board.view.alignement_horizontal = false;
            local_board.view.alignement_vertical = false;
            this.vertices.forEach((vertex: LocalVertex, index) => {
                if (excluded_indices.has(index) == false) {
                    if (Math.abs(vertex.pos.canvas_pos.y - pos_to_align.y) <= 15) {
                        aligned_pos.y = vertex.pos.canvas_pos.y;
                        local_board.view.alignement_horizontal = true;
                        local_board.view.alignement_horizontal_y = local_board.view.canvasCoordY(vertex.pos.y);
                        return;
                    }
                    if (Math.abs(vertex.pos.canvas_pos.x - pos_to_align.x) <= 15) {
                        aligned_pos.x = vertex.pos.canvas_pos.x;
                        local_board.view.alignement_vertical = true;
                        local_board.view.alignement_vertical_x = local_board.view.canvasCoordX(vertex.pos.x);
                        return;
                    }
                }
            })
        }
        if (local_board.view.grid_show) {
            const grid_size = local_board.view.grid_size;
            for (let x = local_board.view.camera.x % grid_size; x < canvas.width; x += grid_size) {
                if (Math.abs(x - pos_to_align.x) <= 15) {
                    aligned_pos.x = x;
                    break;
                }
            }
            for (let y = local_board.view.camera.y % grid_size; y < canvas.height; y += grid_size) {
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

    update_canvas_pos() {
        for (const v of this.vertices.values()) {
            v.pos.update_canvas_pos(local_board.view);
        }
        for (const link of this.links.values()) {
            link.update_canvas_pos(local_board.view);
        }
        for (const area of this.areas.values()){
            area.update_canvas_pos(local_board.view);
        }
        for( const stroke of this.strokes.values()){
            stroke.update_canvas_pos(local_board.view);
        }
        this.set_automatic_weight_positions();
        
    }

    get_subgraph_from_area(area_index: number){
        const area = this.areas.get(area_index);
        const subgraph = new Graph();
        const c1canvas = area.corner_top_left.canvas_pos;
        const c2canvas = area.corner_bottom_right.canvas_pos;   

         for (const [index, v] of this.vertices.entries()) {
            if(v.is_in_rect(c1canvas, c2canvas)){
                subgraph.vertices.set(index, v);
            }
        }

        for (const [index, e] of this.links.entries()){
            const u = this.vertices.get(e.start_vertex);
            const v = this.vertices.get(e.end_vertex);

            if((u.is_in_rect(c1canvas, c2canvas)) && (v.is_in_rect(c1canvas, c2canvas))){
                subgraph.links.set(index, e);
            }
        }
        return subgraph;
    }

    get_induced_subgraph_from_selection(): Graph{
        const subgraph = new Graph();
        for (const [index, v] of this.vertices.entries()) {
            if(v.is_selected){
                const new_vertex = new LocalVertex(v.pos);
                subgraph.vertices.set(index, new_vertex);
            }
        }

        for (const [index, e] of this.links.entries()){
            const u = this.vertices.get(e.start_vertex);
            const v = this.vertices.get(e.end_vertex);
            if(u.is_selected && v.is_selected){
                const new_link = new Link(e.start_vertex, e.end_vertex, e.cp, e.orientation, e.color)
                subgraph.links.set(index, new_link);
            }
        }
        return subgraph;
    }

    translate_area(shift: CanvasCoord, area_index: number, vertices_contained: Set<number>){
        if( this.areas.has(area_index)){
            const area = this.areas.get(area_index);
            this.vertices.forEach((vertex, vertex_index) => {
                if (vertices_contained.has(vertex_index)){
                    vertex.translate(shift, local_board.view);
                }
            })
            for( const link of this.links.values()){
                const v1 = this.vertices.get(link.start_vertex);
                const v2 = this.vertices.get(link.end_vertex);
                if(vertices_contained.has(link.start_vertex) && vertices_contained.has(link.end_vertex)){
                    link.translate_cp(shift, local_board.view);
                }
                else if(vertices_contained.has(link.start_vertex)){ // and thus not v2
                    link.transform_control_point(v1, v2, local_board.view);
                }else if(vertices_contained.has(link.end_vertex)) { // and thus not v1
                    link.transform_control_point(v2, v1, local_board.view);
                }
            }
            area.translate(shift, local_board.view);
            
        }
    }

    vertices_contained_by_area(area: Area): Set<number>{
        const set = new Set<number>();
        this.vertices.forEach((vertex,vertex_index)=> {
            if (area.is_containing_vertex(vertex)){
                set.add(vertex_index);
            }
        })
        return set;
    }

    automatic_weight_position(link_index: number){
        const link = this.links.get(link_index);
        if ( link.weight_div != null){
            const u = this.vertices.get(link.start_vertex);
            const v = this.vertices.get(link.end_vertex);
    
            const posu = u.pos.canvas_pos; 
            const posv = v.pos.canvas_pos; 
            const pos = link.cp.canvas_pos;
            link.weight_position = pos.add(posu.sub2(posv).normalize().rotate_quarter().scale(14));
            link.weight_div.style.top = String(link.weight_position.y - link.weight_div.clientHeight/2);
            link.weight_div.style.left = String(link.weight_position.x- link.weight_div.clientWidth/2);
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

    clear_links(){
        for( const link of this.links.values()){
            if (link.weight_div != null){
                link.weight_div.remove();
            }
        }
        this.links.clear();
    }
}







