
import { Link, ORIENTATION } from '../board/link';
import { Graph } from '../board/graph';
import { Parametor, SENSIBILITY } from './parametor';
import { is_segments_intersection, is_triangles_intersection } from '../utils';

export let param_nb_vertices = new Parametor("Vertices number", "vertex_number", "#vertices", "Print the number of vertices", true, false, [SENSIBILITY.ELEMENT], true);

param_nb_vertices.compute = ((g: Graph) => {
    return String(g.vertices.size)
})


export let param_nb_edges = new Parametor("Edges number", "edge_number", "#edges", "Print the number of edges", true, false, [SENSIBILITY.ELEMENT], true);

param_nb_edges.compute = ((g: Graph) => {
    let counter = 0;
    for (var link of g.links.values()) {
        if (link.orientation == ORIENTATION.UNDIRECTED) {
            counter++;
        }
    }
    return String(counter);
})



export let param_is_connected = new Parametor("Is connected?", "is_connected", "is connected?", "Is the graph/area connected?", false, true, [SENSIBILITY.ELEMENT], true);

param_is_connected.compute = ((g: Graph) => {

    if (g.vertices.size < 2) {
        return "true";
    }

    const indices = Array.from(g.vertices.keys());
    const visited = new Map();
    for (const index of g.vertices.keys()) {
        visited.set(index, false);
    }

    DFS_recursive(g, indices[0], visited);

    for (const is_visited of visited.values()) {
        if (!is_visited) {
            return "false";
        }
    }
    return "true";
});



export let param_number_connected_comp = new Parametor("Number connected component", "number_connected_comp", "#connected comp.", "Compute the number of connected component (undirected)", false, false, [SENSIBILITY.ELEMENT], true);

param_number_connected_comp.compute = ((g: Graph) => {

    if (g.vertices.size < 1) {
        return "0";
    }
    const visited = new Map();
    for (const index of g.vertices.keys()) {
        visited.set(index, false);
    }

    let cc = 0;
    let all_visited = false;

    while (!all_visited) {
        all_visited = true;
        let first_vertex_index;

        for (const index of g.vertices.keys()) {
            if (visited.get(index) === false) {
                first_vertex_index = index;
                all_visited = false;
                cc++;
                break;
            }
        }

        if (all_visited) {
            break;
        }

        DFS_recursive(g, first_vertex_index, visited);

    }
    return String(cc);
});


export let param_number_colors = new Parametor("Number vertex colors", "nb_vertex_colors", "#colors (vertices)", "Print the number of different colors used on the vertices", true, false, [SENSIBILITY.ELEMENT, SENSIBILITY.COLOR], true);

param_number_colors.compute = ((g: Graph) => {
    let colors_set = new Set<string>();
    for (const v of g.vertices.values()) {
        colors_set.add(v.color);
    }
    return String(colors_set.size);

});


export let param_number_geo = new Parametor("Is currently planar?", "planar_current", "planar_current", "Return true iff currently planar", true, true, [SENSIBILITY.ELEMENT, SENSIBILITY.GEOMETRIC], true);

param_number_geo.compute = ((g: Graph) => {

    for (const link_index of g.links.keys()) {
        const link1 = g.links.get(link_index);
        const v1 = g.vertices.get(link1.start_vertex);
        const w1 = g.vertices.get(link1.end_vertex);
        const z1 = link1.cp;
        for (const link_index2 of g.links.keys()) {
            const link2 = g.links.get(link_index2);
            const v2 = g.vertices.get(link2.start_vertex);
            const w2 = g.vertices.get(link2.end_vertex);
            const z2 = link2.cp;
            if (link_index2 != link_index &&
                //is_segments_intersection(v1.pos, w1.pos, v2.pos, w2.pos)
                is_triangles_intersection(v1.pos, w1.pos, z1, v2.pos, w2.pos, z2)
            ) {
                return "false";
            }
        }
    }
    return "true";
});



export let param_min_degree = new Parametor("Minimum degree", "min_degree", "min degree", "Print the minimum degree", true, false, [SENSIBILITY.ELEMENT], true);

param_min_degree.compute = ((g: Graph, verbose) => {
    const data = get_degrees_data(g);
    if (verbose) {
        for (const vertex_index of data.min_vertices) {
            const vertex = g.vertices.get(vertex_index);
            vertex.color = "red";
        }
        g.vertices.forEach((vertex, vertex_index) => {
            vertex.update_param(param_min_degree.id, String(g.get_neighbors_list(vertex_index).length));
        })
    }
    return String(data.min_value);
});


export let param_max_degree = new Parametor("Maximum degree", "max_degree", "max degree", "Print the minimum degree", true, false, [SENSIBILITY.ELEMENT], true);

param_max_degree.compute = ((g: Graph) => {
    const data = get_degrees_data(g);
    return String(data.max_value);
});

export let param_average_degree = new Parametor("Average degree", "avg_degree", "avg. degree", "Print the average degree", true, false, [SENSIBILITY.ELEMENT], true);

param_average_degree.compute = ((g: Graph) => {
    // Remark : If no loop, we can simply use that sum(degree) = 2|E| so avg(degree) = 2|E|/|V|
    const data = get_degrees_data(g);
    const avg = Math.round((data.avg + Number.EPSILON) * 100) / 100

    return String(avg);
});


export let param_has_proper_coloring = new Parametor("Proper vertex-coloring?", "has_proper_coloring", "proper vertex-coloring?", "Print if the current coloring of the vertices is proper or not", false, true, [SENSIBILITY.ELEMENT, SENSIBILITY.COLOR], true);

param_has_proper_coloring.compute = ((g: Graph) => {

    if (g.vertices.size == 0) {
        return "true";
    }

    const visited = new Map();
    for (const index of g.vertices.keys()) {
        visited.set(index, false);
    }

    const v_index = g.vertices.keys().next().value;

    const S = Array();
    S.push(v_index);

    while (S.length !== 0) {
        const v_index = S.pop();
        if (!visited.get(v_index)) {
            visited.set(v_index, true);
            const v = g.vertices.get(v_index);
            const neighbors = g.get_neighbors_list(v_index);
            for (const u_index of neighbors) {
                const u = g.vertices.get(u_index);
                if (u.color === v.color) {
                    return "false";
                }
                S.push(u_index);
            }
        }
    }

    return "true";

});



export let param_diameter = new Parametor("Diameter", "diameter", "diameter", "Print the diameter of the graph", false, false, [SENSIBILITY.ELEMENT], true);

param_diameter.compute = ((g: Graph) => {
    const FW = Floyd_Warhall(g, false);
    let diameter = 0;

    for (const v_index of g.vertices.keys()) {
        for (const u_index of g.vertices.keys()) {
            if (diameter < FW.distances.get(v_index).get(u_index)) {
                diameter = FW.distances.get(v_index).get(u_index);
            }
        }
    }

    if (diameter === Infinity) {
        return String("+∞")
    }
    return String(diameter);
});

// -----------------

export let param_is_good_weight = new Parametor("Is good weight for our problem ?", "isgood", "isgood", "Paramètre trop stylé", true, true, [SENSIBILITY.ELEMENT, SENSIBILITY.WEIGHT], false);

param_is_good_weight.compute = ((g: Graph) => {
    const FW = Floyd_Warhall(g, true);

    for (const v_index of g.vertices.keys()) {
        for (const u_index of g.vertices.keys()) {
            if (u_index != v_index) {
                for (const w_index of g.vertices.keys()) {
                    if (w_index != u_index && w_index != v_index) {
                        if (FW.distances.get(u_index).get(v_index) == FW.distances.get(v_index).get(w_index)) {
                            g.vertices.get(v_index).color = "red";
                            g.vertices.get(u_index).color = "purple";
                            g.vertices.get(w_index).color = "purple";
                            return "false";
                        }
                    }
                }
            }
        }
    }
    return "true";
})

// -----------------

export const param_weighted_distance_identification = new Parametor("param_weighted_distance_identification", "wdi", "wdi", "Paramètre trop stylé", true, false, [SENSIBILITY.ELEMENT, SENSIBILITY.WEIGHT], false);

param_weighted_distance_identification.compute = ((g: Graph) => {
    console.log("compute TIME");
    console.time('wdi')
    let k = 1;

    if (is_connected(g) == false) {
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

            // k k 1 2 3

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






            // 1 2 k k
            /*
            const rheap = new Array<Link>();
            let found = false;
            while (heap.length > 0){
                const last_link = heap.pop();
                const weight = parseInt(last_link.weight);
                if (weight == k){
                    last_link.weight = String(1);
                    rheap.push(last_link);
                }else {
                    last_link.weight = String(weight+1);
                    while (rheap.length > 0){
                        const rlink = rheap.pop();
                        heap.push(rlink);
                    } 
                    found = true;
                    break;
                }
            }
            if (found == false){
                k++;
                if (k > 3){
                    return "";
                }
                break;
            }*/

        }
    }

})


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


// --------------------


function get_degrees_data(g: Graph) {
    if (g.vertices.size == 0) {
        return { min_value: 0, min_vertices: null, max_value: 0, max_vertices: null, avg: 0 };
    }

    const index_first = g.vertices.keys().next().value;
    let min_indices = new Set([index_first]);
    let min_degree = g.get_neighbors_list(index_first).length;
    let max_indices = new Set([index_first]);
    let max_degree = g.get_neighbors_list(index_first).length;
    let average = 0.0;

    for (const v_index of g.vertices.keys()) {
        const neighbors = g.get_neighbors_list(v_index);
        if (min_degree > neighbors.length) {
            min_degree = neighbors.length;
            min_indices = new Set([v_index]);
        }
        if (min_degree === neighbors.length) {
            min_indices.add(v_index);
        }

        if (max_degree < neighbors.length) {
            max_degree = neighbors.length;
            max_indices = new Set([v_index]);
        }
        if (max_degree === neighbors.length) {
            max_indices.add(v_index);
        }

        average += neighbors.length;
    }

    average = average / g.vertices.size;

    return { min_value: min_degree, min_vertices: min_indices, max_value: max_degree, max_vertices: max_indices, avg: average };
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