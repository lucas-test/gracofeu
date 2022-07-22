import { Area, AREA_CORNER, AREA_SIDE } from "./area";
import { INDEX_TYPE } from "./camera";
import { CanvasCoord } from "./coord";
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
            if (interactable_element_type.has(DOWN_TYPE.CONTROL_POINT) && link.canvas_cp.is_nearby(pos, 150)) {
                return { type: DOWN_TYPE.CONTROL_POINT, index: index };
            }
            if (interactable_element_type.has(DOWN_TYPE.LINK) && this.is_click_over_link(index, pos)) {
                return { type: DOWN_TYPE.LINK, index: index };
            }
        }

        for(const [index,a] of this.areas.entries()){
            if(interactable_element_type.has(DOWN_TYPE.AREA) && a.is_nearby(pos, 200)){
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
                if(s.is_nearby(pos, 150)){     
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

        let xA = e.x - 5
        let yA = e.y - 5
        let xB = e.x + 5
        let yB = e.y + 5

        let minX = xA
        let minY = yA
        let maxX = xB
        let maxY = yB

        const link = this.links.get(link_index);
        const v = this.vertices.get(link.start_vertex)
        const w = this.vertices.get(link.end_vertex)
        const linkcp_canvas = local_board.view.canvasCoord(link.cp);
        const v_canvas_pos = v.canvas_pos;
        const w_canvas_pos = w.canvas_pos

        let x0 = v_canvas_pos.x;
        let y0 = v_canvas_pos.y;
        let x1 = linkcp_canvas.x;
        let y1 = linkcp_canvas.y;
        let x2 = w_canvas_pos.x;
        let y2 = w_canvas_pos.y;


        // case where one of the endvertices is already on the box
        if (v.is_in_rect(new CanvasCoord(xA, yA), new CanvasCoord(xB, yB)) || w.is_in_rect(new CanvasCoord(xA, yA), new CanvasCoord(xB, yB))) {
            return true
        } else {
            // we get the quadratic equation of the intersection of the bended edge and the sides of the box
            let aX = (x2 + x0 - 2 * x1);
            let bX = 2 * (x1 - x0);
            let cXmin = x0 - minX;
            let cXmax = x0 - maxX;

            let aY = (y2 + y0 - 2 * y1);
            let bY = 2 * (y1 - y0);
            let cYmin = y0 - minY;
            let cYmax = y0 - maxY;

            // the candidates for the intersections
            let tXmin = solutionQuadratic(aX, bX, cXmin);
            let tXmax = solutionQuadratic(aX, bX, cXmax);
            let tYmin = solutionQuadratic(aY, bY, cYmin);
            let tYmax = solutionQuadratic(aY, bY, cYmax);


            for (let t of tXmax.concat(tXmin)) { // we look for the candidates that are touching vertical sides
                if (t >= 0 && t <= 1) {
                    let y = bezierValue(t, y0, y1, y2);
                    if ((minY <= y && y <= maxY)) { // the candidate touches the box
                        return true;
                    }
                }
            }

            for (let t of tYmax.concat(tYmin)) {
                if (t >= 0 && t <= 1) {
                    let x = bezierValue(t, x0, x1, x2);
                    if ((minX <= x && x <= maxX)) {
                        return true;
                    }
                }
            }

        }
        return false;
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
            this.vertices.forEach((vertex, index) => {
                if (excluded_indices.has(index) == false) {
                    if (Math.abs(vertex.canvas_pos.y - pos_to_align.y) <= 15) {
                        aligned_pos.y = vertex.canvas_pos.y;
                        local_board.view.alignement_horizontal = true;
                        local_board.view.alignement_horizontal_y = local_board.view.canvasCoordY(vertex.pos.y);
                        return;
                    }
                    if (Math.abs(vertex.canvas_pos.x - pos_to_align.x) <= 15) {
                        aligned_pos.x = vertex.canvas_pos.x;
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
            v.canvas_pos = local_board.view.canvasCoord(v.pos);
        }
        for (const link of this.links.values()) {
            link.canvas_cp = local_board.view.canvasCoord(link.cp)
        }
        // TODO when area and stroke will have canvas_pos
        /*
        for (const area of this.areas.values()){
            area.update_canvas_pos();
        }
        for( const stroke of this.strokes.values()){
            stroke.update_canvas_pos();
        }
        */
    }

    get_subgraph_from_area(area_index: number){
        const area = this.areas.get(area_index);
        const subgraph = new Graph();
        const c1canvas = local_board.view.canvasCoord(area.corner_top_left);
        const c2canvas = local_board.view.canvasCoord(area.corner_bottom_right);   

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

}




function solutionQuadratic(a: number, b: number, c: number) {
    if (b == 0 && a == 0) {
        return [];
    }

    if (a == 0) {
        return [-c / b];
    }

    let delta = b * b - 4 * a * c;
    if (delta > 0) {
        return [(-b + Math.sqrt(delta)) / (2 * a), (-b - Math.sqrt(delta)) / (2 * a)];
    }
    if (delta == 0) {
        return [-b / (2 * a)];
    }
    return [];
}



function bezierValue(t: number, p0: number, p1: number, p2: number) {
    return (1.0 - t) * (1.0 - t) * p0 + 2.0 * (1.0 - t) * t * p1 + t * t * p2;
    // return bezierPoint(p0, p1, p1, p2, t);
}




