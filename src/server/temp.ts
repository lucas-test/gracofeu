// TODO this is temporary
// this should be unified with the Graph Library from client

import { Graph } from "./graph";
import { Link } from "./link";


export function param_weighted_distance_identification(g: Graph): string {
    console.log("compute TIME");
    console.time('wdi')
    let k = 1;

    if (is_connected(g) == false) {
        console.log("NC")
        return "NC";
    }

    while (true) {
        console.log("k = ", k);

        const heap = new Array<Link>();
        for (const link of g.links.values()) {
            heap.push(link);
            link.weight = String(1);
        }

        while (true) {


            if (test(g)) {
                const debug = new Array();
                for (const link of g.links.values()) {
                    debug.push(link.weight);
                }
                console.log("try ", debug);
                console.timeEnd('wdi')
                return String(k);
            }

            let b = 0;
            let done = false;
            while (b < heap.length && heap[b].weight == String(k)) {
                heap[b].weight = String(1);
                b += 1;
            }
            if (b == heap.length) {
                done = true; k++;
                break;
            } else {
                heap[b].weight = String(parseInt(heap[b].weight) + 1);
            }

        }
    }

}


function test(g: Graph) {
    const FW = Floyd_Warhall(g, true);
    for (const v_index of g.vertices.keys()) {
        for (const u_index of g.vertices.keys()) {
            if (u_index != v_index) {
                for (const w_index of g.vertices.keys()) {
                    if (w_index != u_index && w_index != v_index) {
                        if (FW.distances.get(u_index).get(v_index) == FW.distances.get(v_index).get(w_index)) {
                            return false;
                        }
                    }
                }
            }
        }
    }
    return true;
}

function is_connected(g: Graph): boolean {
    if (g.vertices.size < 2) {
        return true;
    }

    const indices = Array.from(g.vertices.keys());
    const visited = new Map();
    for (const index of g.vertices.keys()) {
        visited.set(index, false);
    }

    DFS_recursive(g, indices[0], visited);

    for (const is_visited of visited.values()) {
        if (!is_visited) {
            return false;
        }
    }
    return true;
}



function DFS_recursive(g: Graph, v_index: number, visited: Map<number, boolean>) {
    visited.set(v_index, true);
    const neighbors = g.get_neighbors_list(v_index);

    for (const u_index of neighbors) {
        if (visited.has(u_index) && !visited.get(u_index)) {
            DFS_recursive(g, u_index, visited);
        }
    }
}

function DFS_iterative(g: Graph, v_index: number) {
    const visited = new Map();
    for (const index of g.vertices.keys()) {
        visited.set(index, false);
    }
    console.log(visited);

    const S = Array();
    S.push(v_index);

    while (S.length !== 0) {
        const u_index = S.pop();
        if (!visited.get(u_index)) {
            visited.set(u_index, true);
            const neighbors = g.get_neighbors_list(u_index);
            for (const n_index of neighbors) {
                S.push(n_index);
            }
        }
    }

    return visited;
}



function Floyd_Warhall(g: Graph, weighted: boolean) {
    const dist = new Map<number, Map<number, number>>();
    const next = new Map<number, Map<number, number>>();

    for (const v_index of g.vertices.keys()) {
        dist.set(v_index, new Map<number, number>());
        next.set(v_index, new Map<number, number>());

        for (const u_index of g.vertices.keys()) {
            if (v_index === u_index) {
                dist.get(v_index).set(v_index, 0);
                next.get(v_index).set(v_index, v_index);
            }
            else {
                dist.get(v_index).set(u_index, Infinity);
                next.get(v_index).set(u_index, Infinity);
            }
        }
    }

    for (const e_index of g.links.keys()) {
        const e = g.links.get(e_index);
        // TODO: Oriented Case
        let weight = 1;
        if (weighted) {
            weight = parseFloat(e.weight);
        }
        dist.get(e.start_vertex).set(e.end_vertex, weight);
        dist.get(e.end_vertex).set(e.start_vertex, weight);

        next.get(e.start_vertex).set(e.end_vertex, e.start_vertex);
        next.get(e.end_vertex).set(e.start_vertex, e.end_vertex);
    }

    for (const k_index of g.vertices.keys()) {
        for (const i_index of g.vertices.keys()) {
            for (const j_index of g.vertices.keys()) {
                const direct = dist.get(i_index).get(j_index);
                const shortcut_part_1 = dist.get(i_index).get(k_index);
                const shortcut_part_2 = dist.get(k_index).get(j_index);

                if (direct > shortcut_part_1 + shortcut_part_2) {
                    dist.get(i_index).set(j_index, shortcut_part_1 + shortcut_part_2);
                    next.get(i_index).set(j_index, next.get(i_index).get(k_index));
                }
            }
        }
    }

    return { distances: dist, next: next };

}