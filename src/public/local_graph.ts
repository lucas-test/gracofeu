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
    selected: boolean;

    constructor(i: number, j: number) {
        this.start_vertex = i;
        this.end_vertex = j;
        this.selected = false;
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

}


export const local_graph = new Graph();