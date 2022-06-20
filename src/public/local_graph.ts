
import { INDEX_TYPE, view } from "./camera";
import { DOWN_TYPE } from "./interactors/interactor";

export class Coord {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    sub(c: Coord) {
        return new Coord(this.x - c.x, this.y - c.y);
    }

    add(c: Coord) {
        return new Coord(this.x + c.x, this.y + c.y);
    }

    dist2(pos: Coord) {
        return (this.x - pos.x) ** 2 + (this.y - pos.y) ** 2;
    }

    is_nearby(pos: Coord, r: number) {
        return this.dist2(pos) <= r;
    }

    getTheta(v: Coord) {
        let angle1 = Math.atan2(this.x, this.y);
        let angle2 = Math.atan2(v.x, v.y);
        return angle2 - angle1;
    }

    norm2() {
        return this.x ** 2 + this.y ** 2;
    }

    getRho(v: Coord) {
        let d1 = this.norm2();
        let d2 = v.norm2();
        return Math.sqrt(d2 / d1);
    }
}

export class CanvasCoord extends Coord {
    lol: number;
    
} 

export class ServerCoord extends Coord {
    lol2: number;
}





export class LocalVertex {
    pos: ServerCoord;
    old_pos: ServerCoord;
    is_selected: boolean;
    index_string: string;

    constructor(pos: ServerCoord) {
        this.pos = new ServerCoord(pos.x, pos.y); // this.pos = pos; does not copy the methods of Coord ...
        this.old_pos = new ServerCoord(pos.x, pos.y);
        this.is_selected = false;
        this.index_string = "";
    }

    save_pos() {
        this.old_pos.x = this.pos.x;
        this.old_pos.y = this.pos.y;
    }


    dist2(x: number, y: number) {
        return (this.pos.x - x) ** 2 + (this.pos.y - y) ** 2
    }


    is_nearby(pos: ServerCoord, r: number) {
        return this.pos.dist2(pos) <= r;
    }

    is_in_rect(c1: ServerCoord, c2: ServerCoord) {
        if (c1.x <= c2.x && c1.y <= c2.y) {
            return (c1.x <= this.pos.x && this.pos.x <= c2.x && c1.y <= this.pos.y && this.pos.y <= c2.y)
        } else if (c1.x <= c2.x && c2.y <= c1.y) {
            return (c1.x <= this.pos.x && this.pos.x <= c2.x && c2.y <= this.pos.y && this.pos.y <= c1.y)
        } else if (c2.x <= c1.x && c2.y <= c1.y) {
            return (c2.x <= this.pos.x && this.pos.x <= c1.x && c2.y <= this.pos.y && this.pos.y <= c1.y)
        } else if (c2.x <= c1.x && c1.y <= c2.y) {
            return (c2.x <= this.pos.x && this.pos.x <= c1.x && c1.y <= this.pos.y && this.pos.y <= c2.y)
        }
    }
}





export enum ORIENTATION {
    UNDIRECTED,
    DIRECTED,
    DIGON
}


export class Link {
    start_vertex: number;
    end_vertex: number;
    cp: ServerCoord;
    old_cp: ServerCoord;
    is_selected: boolean;
    orientation: ORIENTATION;

    constructor(i: number, j: number, cp: ServerCoord, orientation: ORIENTATION) {
        this.start_vertex = i;
        this.end_vertex = j;
        this.is_selected = false;
        this.cp = new ServerCoord(cp.x, cp.y);
        this.old_cp = new ServerCoord(cp.x, cp.y);
        this.orientation = orientation;
    }

    is_in_rect(c1: ServerCoord, c2: ServerCoord) {
        //V1: is in rect if one of its extremities is in the rectangle
        //TODO: be more clever and select also when there is an intersection between the edge and the rectangle

        return local_graph.vertices.get(this.start_vertex).is_in_rect(c1, c2) || local_graph.vertices.get(this.end_vertex).is_in_rect(c1, c2);
    }

    is_nearby(x: number, y: number, r: number) {
        const start = local_graph.vertices.get(this.start_vertex);
        const end = local_graph.vertices.get(this.end_vertex);
        const x1 = start.pos.x;
        const y1 = start.pos.y;
        const x2 = end.pos.x;
        const y2 = end.pos.y;

        const den = start.dist2(x2, y2);
        if (den == 0) {
            return true;
        }
        const num = Math.abs((x2 - x1) * (y1 - y) - (x1 - x) * (y2 - y1))

        return (num / den) < r;
    }

    transform_control_point(moved_vertex: LocalVertex, fixed_vertex: LocalVertex) {
        var v = moved_vertex
        var w = fixed_vertex.pos
        let u = v.old_pos.sub(w);
        let nv = v.pos.sub(w);
        var theta = nv.getTheta(u)
        var rho = u.getRho(nv)
        this.cp.x = w.x + rho * (Math.cos(theta) * (this.old_cp.x - w.x) - Math.sin(theta) * (this.old_cp.y - w.y))
        this.cp.y = w.y + rho * (Math.sin(theta) * (this.old_cp.x - w.x) + Math.cos(theta) * (this.old_cp.y - w.y))
    }

    save_pos() {
        this.old_cp.x = this.cp.x;
        this.old_cp.y = this.cp.y;
    }
}

export class Graph {
    vertices: Map<number, LocalVertex>;
    links: Map<number, Link>;

    constructor() {
        this.vertices = new Map();
        this.links = new Map();
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

    clear_all_selections() {
        this.deselect_all_vertices();
        this.deselect_all_links();
    }

    get_element_nearby(pos: ServerCoord) {
        for (const [index, v] of this.vertices.entries()) {
            if (v.pos.is_nearby(pos, 150)) {
                return { type: DOWN_TYPE.VERTEX, index: index };
            }
        }

        for (const [index, link] of this.links.entries()) {
            if (link.cp.is_nearby(pos, 150)) {
                return { type: DOWN_TYPE.CONTROL_POINT, index: index };
            }
            if (this.is_click_over_link(index, pos)) {
                return { type: DOWN_TYPE.LINK, index: index };
            }
        }

        return { type: DOWN_TYPE.EMPTY, index: null };
    }

    get_vertex_index_nearby(pos: ServerCoord) {
        for (let index of this.vertices.keys()) {
            let v = this.vertices.get(index);
            if (v.is_nearby(pos, 150)) {
                return index;
            }
        }
        return null;
    }

    get_link_index_nearby(x: number, y: number) {
        for (let index of this.links.keys()) {
            let link = this.links.get(index);
            if (link.is_nearby(x, y, 0.015)) {
                return index;
            }
        }
        return null;
    }

    select_vertices_in_rect(corner1: CanvasCoord, corner2: CanvasCoord) {
        for (const vertex of this.vertices.values()) {
            if (vertex.is_in_rect( view.serverCoord2(corner1),view.serverCoord2(corner2))) {
                vertex.is_selected = true;
            }
        }
    }

    select_links_in_rect(corner1: CanvasCoord, corner2: CanvasCoord) {
        for (const index of this.links.keys()) {
            const link = this.links.get(index);
            if (link.is_in_rect( view.serverCoord2(corner1),view.serverCoord2(corner2))) {
                link.is_selected = true;
            }
        }
    }

    is_click_over_link(link_index: number, e: Coord) {
        let xA = e.x - 5
        let yA = e.y - 5
        let xB = e.x + 5
        let yB = e.y + 5

        let minX = xA
        let minY = yA
        let maxX = xB
        let maxY = yB

        let link = this.links.get(link_index);
        let v = this.vertices.get(link.start_vertex)
        let w = this.vertices.get(link.end_vertex)
        let x0 = v.pos.x;
        let y0 = v.pos.y;
        let x1 = link.cp.x;
        let y1 = link.cp.y;
        let x2 = w.pos.x;
        let y2 = w.pos.y;


        // case where one of the endvertices is already on the box
        if (v.is_in_rect(new ServerCoord(xA, yA), new ServerCoord(xB, yB)) || w.is_in_rect(new ServerCoord(xA, yA), new ServerCoord(xB, yB))) {
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

    align_position(pos: ServerCoord, mouse_server_coord: ServerCoord, excluded_indices: Set<number>){
        if (view.is_aligning){
            view.alignement_horizontal = false;
            view.alignement_vertical = false;
            this.vertices.forEach((vertex, index) => {
                if (excluded_indices.has(index) == false ){
                    if (Math.abs(vertex.pos.y - mouse_server_coord.y) <= 15) {
                        pos.y = vertex.pos.y;
                        view.alignement_horizontal = true;
                        view.alignement_horizontal_y = view.canvasCoordY(vertex.pos.y);
                        return;
                    }
                    if (Math.abs(vertex.pos.x - mouse_server_coord.x) <= 15) {
                        pos.x = vertex.pos.x;
                        view.alignement_vertical = true;
                        view.alignement_vertical_x = view.canvasCoordX(vertex.pos.x);
                        return;
                    }
                }
            })
        }
    }

    get_selected_vertices() : Set<number>{
        const set = new Set<number>();
        this.vertices.forEach((v,index)=>{
            if( v.is_selected){
                set.add(index);
            }
        })
        return set;
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



export const local_graph = new Graph();