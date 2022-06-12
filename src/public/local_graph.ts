import { Coord } from "../server/coord";

// export const selected_vertices_indices = new Set<number>();
// // export const 
// export const selected_vertices_last_pos = new Map<number, Coord>();


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

}

export function deselect_all_vertices() {
    local_vertices.forEach(vertex => {
        vertex.is_selected = false;
    });
}


export function get_vertex_index_nearby(x: number, y: number) {
    for (let index of local_vertices.keys()) {
        let v = local_vertices.get(index);
        if (v.is_nearby(x, y, 150)) {
            return index;
        }
    }
    return null;
}

export const local_vertices = new Map<number, LocalVertex>();