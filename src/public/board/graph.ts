import { ClientArea, AREA_CORNER, AREA_SIDE } from "./area";
import { INDEX_TYPE, View } from "./camera";
import { DOWN_TYPE } from "../interactors/interactor";
import { ClientStroke } from "./stroke";
import { CanvasCoord, ClientVertex } from "./vertex";
import { ClientLink } from "./link";
import { Coord, Graph, Link, middle, ORIENTATION, Vect } from "gramoloss";
import { CanvasVect } from "./vect";
import { draw_circle } from "../draw_basics";
import { draw } from "../draw";




export class ClientGraph extends Graph<ClientVertex, ClientLink> {
 
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
        if (view.display_triangular_grid) {
            const grid_size = view.grid_size;
            const h = grid_size*Math.sqrt(3)/2;

            // find the corners of the quadrilateral containing the point
            const px = ((pos_to_align.x-view.camera.x)- (pos_to_align.y-view.camera.y)/Math.sqrt(3))/grid_size;
            const py = (pos_to_align.y-view.camera.y)/h;
            const i = Math.floor(px);
            const j = Math.floor(py);
            const corners = [
                new Coord(i*grid_size + j*grid_size/2, Math.sqrt(3)*j*grid_size/2), // top left
                new Coord((i+1)*grid_size + j*grid_size/2, Math.sqrt(3)*j*grid_size/2), // top right
                new Coord(i*grid_size + (j+1)*grid_size/2, Math.sqrt(3)*(j+1)*grid_size/2), // bottom left
                new Coord((i+1)*grid_size + (j+1)*grid_size/2, Math.sqrt(3)*(j+1)*grid_size/2) // bottom right
            ]
            
            // align on the corners if the point is near enough
            for (let corner of corners){
                corner = corner.add(view.camera);
                if (Math.sqrt(corner.dist2(pos_to_align)) <= 2*15){
                    aligned_pos.x = corner.x;
                    aligned_pos.y = corner.y;
                    return aligned_pos;
                }
            }

            // projection on the \ diagonal starting at the top left corner
            const projection1 = pos_to_align.orthogonal_projection(corners[0], new Vect(1 , Math.sqrt(3))) ; 
            if (projection1.dist2(pos_to_align) <= 15*15){
                aligned_pos.x = projection1.x;
                aligned_pos.y = projection1.y;
            }

            // projection on the \ diagonal starting at the top right corner
            const projection2 = pos_to_align.orthogonal_projection(corners[1], new Vect(1 , Math.sqrt(3))) ; 
            if (projection2.dist2(pos_to_align) <= 15*15){
                aligned_pos.x = projection2.x;
                aligned_pos.y = projection2.y;
            }

            // projection on the / diagonal starting at the top right corner
            const projection = pos_to_align.orthogonal_projection(corners[1], new Vect(-1 , Math.sqrt(3))) ; 
            if (projection.dist2(pos_to_align) <= 15*15){
                aligned_pos.x = projection.x;
                aligned_pos.y = projection.y;
            }

            // align on the horizontal lines
            for (let k of [0,3]){ // 0 and 3 are the indices of the top left and bottom right corner
                // of the quadrilateral containing the point
                let y = corners[k].y;
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
        const link = new ClientLink(index1, index2, "", ORIENTATION.UNDIRECTED, "black", "", view);
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







