export class Coord {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    sub(c:Coord) {
        return new Coord(this.x - c.x, this.y - c.y);
    }
}



export class LocalVertex {
    pos: Coord;
    old_pos: Coord;
    is_selected: boolean;

    constructor(pos: Coord) {
        this.pos = pos;
        this.old_pos = pos;
        this.is_selected = false;
    }

    dist2(x: number, y: number) {
        return (this.pos.x - x) ** 2 + (this.pos.y - y) ** 2
    }


    is_nearby(x: number, y: number, r: number) {
        return this.dist2(x, y) <= r;
    }

    is_in_rect(c1: Coord, c2: Coord) {
        if (c1.x <= c2.x && c1.y <= c2.y) {
            return (c1.x <= this.pos.x && this.pos.x <= c2.x && c1.y  <= this.pos.y && this.pos.y <= c2.y)
        } else if (c1.x <= c2.x && c2.y <= c1.y ) {
            return (c1.x <= this.pos.x && this.pos.x <= c2.x && c2.y <= this.pos.y && this.pos.y <= c1.y )
        } else if (c2.x <= c1.x && c2.y <= c1.y ) {
            return (c2.x <= this.pos.x && this.pos.x <= c1.x && c2.y <= this.pos.y && this.pos.y <= c1.y )
        } else if (c2.x <= c1.x && c1.y  <= c2.y) {
            return (c2.x <=this.pos.x && this.pos.x <= c1.x && c1.y  <= this.pos.y && this.pos.y <= c2.y)
        }
    }
}








export class Edge {
    start_vertex: number;
    end_vertex: number;
    is_selected: boolean;

    constructor(i: number, j: number) {
        this.start_vertex = i;
        this.end_vertex = j;
        this.is_selected = false;
    }

    is_in_rect(c1: Coord, c2: Coord){
        //V1: is in rect if one of its extremities is in the rectangle
        //TODO: be more clever and select also when there is an intersection between the edge and the rectangle

        return local_graph.vertices.get(this.start_vertex).is_in_rect(c1, c2) || local_graph.vertices.get(this.end_vertex).is_in_rect(c1, c2);
    }
}

export class Graph {
    vertices: Map<number, LocalVertex>;
    edges: Array<Edge>;

    constructor() {
        this.vertices = new Map();
        this.edges = new Array();
    }


    deselect_all_vertices() {
        this.vertices.forEach(vertex => {
            vertex.is_selected = false;
        });
    }

    deselect_all_edges() {
        this.edges.forEach(edge => {
            edge.is_selected = false;
        });
    }

    clear_all_selections(){
        this.deselect_all_vertices();
        this.deselect_all_edges();
    }

    get_vertex_index_nearby(x: number, y: number) {
        for (let index of this.vertices.keys()) {
            let v = this.vertices.get(index);
            if (v.is_nearby(x, y, 150)) {
                return index;
            }
        }
        return null;
    }

    select_vertices_in_rect(corner1: Coord, corner2: Coord, cam: Coord) {
        for (const vertex of this.vertices.values()) {
            if ( vertex.is_in_rect(corner1.sub(cam), corner2.sub(cam))){
                vertex.is_selected = true;
            }
        }
    }

    select_edges_in_rect(corner1:Coord, corner2:Coord, cam: Coord){
        for(const edge of this.edges){
            if( edge.is_in_rect(corner1.sub(cam), corner2.sub(cam))){
                edge.is_selected = true;
            }
        }
    }

}


export const local_graph = new Graph();