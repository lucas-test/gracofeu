
import { ClientGraph } from '../board/graph';
import { Parametor, SENSIBILITY } from './parametor';
import { is_segments_intersection, is_triangles_intersection } from '../utils';
import { ORIENTATION } from 'gramoloss';
import { ClientLink } from '../board/link';

export let param_has_cycle = new Parametor("Has cycle?", "has_cycle", "?has_cycle", "Check if the graph has an undirected cycle", true, true, [SENSIBILITY.ELEMENT], false);

param_has_cycle.compute = ((g: ClientGraph) => {
    return String(g.has_cycle());
})

export let param_has_directed_cycle = new Parametor("Has directed cycle?", "has_directed_cycle", "?has_directed_cycle", "Check if the graph has a directed cycle", true, true, [SENSIBILITY.ELEMENT], false);

param_has_directed_cycle.compute = ((g: ClientGraph) => {
    return String(g.has_directed_cycle());
})

export let param_nb_vertices = new Parametor("Vertices number", "vertex_number", "#vertices", "Print the number of vertices", true, false, [SENSIBILITY.ELEMENT], true);

param_nb_vertices.compute = ((g: ClientGraph) => {
    return String(g.vertices.size)
})


export let param_nb_edges = new Parametor("Edges number", "edge_number", "#edges", "Print the number of edges", true, false, [SENSIBILITY.ELEMENT], true);

param_nb_edges.compute = ((g: ClientGraph) => {
    let counter = 0;
    for (var link of g.links.values()) {
        if (link.orientation == ORIENTATION.UNDIRECTED) {
            counter++;
        }
    }
    return String(counter);
})



export let param_is_connected = new Parametor("Is connected?", "is_connected", "is connected?", "Is the graph/area connected?", true, true, [SENSIBILITY.ELEMENT], true);

param_is_connected.compute = ((g: ClientGraph) => {

    if (g.vertices.size < 2) {
        return "true";
    }

    const indices = Array.from(g.vertices.keys());
    const visited = new Map();
    for (const index of g.vertices.keys()) {
        visited.set(index, false);
    }

    g.DFS_recursive( indices[0], visited);

    for (const is_visited of visited.values()) {
        if (!is_visited) {
            return "false";
        }
    }
    return "true";
});



export let param_number_connected_comp = new Parametor("Number connected component", "number_connected_comp", "#connected comp.", "Compute the number of connected component (undirected)", true, false, [SENSIBILITY.ELEMENT], true);

param_number_connected_comp.compute = ((g: ClientGraph) => {

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

        g.DFS_recursive( first_vertex_index, visited);

    }
    return String(cc);
});


export let param_number_colors = new Parametor("Number vertex colors", "nb_vertex_colors", "#colors (vertices)", "Print the number of different colors used on the vertices", true, false, [SENSIBILITY.ELEMENT, SENSIBILITY.COLOR], true);

param_number_colors.compute = ((g: ClientGraph) => {
    let colors_set = new Set<string>();
    for (const v of g.vertices.values()) {
        colors_set.add(v.color);
    }
    return String(colors_set.size);

});


export let param_number_geo = new Parametor("Is currently planar?", "planar_current", "planar_current", "Return true iff currently planar", true, true, [SENSIBILITY.ELEMENT, SENSIBILITY.GEOMETRIC], true);

param_number_geo.compute = ((g: ClientGraph) => {

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

param_min_degree.compute = ((g: ClientGraph, verbose) => {
    const data = g.get_degrees_data();
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

param_max_degree.compute = ((g: ClientGraph) => {
    const data = g.get_degrees_data();
    return String(data.max_value);
});

export let param_average_degree = new Parametor("Average degree", "avg_degree", "avg. degree", "Print the average degree", true, false, [SENSIBILITY.ELEMENT], true);

param_average_degree.compute = ((g: ClientGraph) => {
    // Remark : If no loop, we can simply use that sum(degree) = 2|E| so avg(degree) = 2|E|/|V|
    const data = g.get_degrees_data();
    const avg = Math.round((data.avg + Number.EPSILON) * 100) / 100

    return String(avg);
});


export let param_has_proper_coloring = new Parametor("Proper vertex-coloring?", "has_proper_coloring", "proper vertex-coloring?", "Print if the current coloring of the vertices is proper or not", true, true, [SENSIBILITY.ELEMENT, SENSIBILITY.COLOR], true);

param_has_proper_coloring.compute = ((g: ClientGraph) => {

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



export let param_diameter = new Parametor("Diameter", "diameter", "diameter", "Print the diameter of the graph", true, false, [SENSIBILITY.ELEMENT], true);

param_diameter.compute = ((g: ClientGraph) => {
    const FW = g.Floyd_Warhall(false);
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

param_is_good_weight.compute = ((g: ClientGraph) => {
    const FW = g.Floyd_Warhall( true);

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

export const param_weighted_distance_identification = new Parametor("Weighted distance identification number", "wdin", "wdin", "Weighted distance identification number", false, false, [SENSIBILITY.ELEMENT, SENSIBILITY.WEIGHT], false);

param_weighted_distance_identification.compute = ((g: ClientGraph) => {
    console.log("compute TIME");
    console.time('wdi')
    let k = 1;

    if (is_connected(g) == false) {
        return "NC";
    }

    while (true) {
        console.log("k = ", k);
  
        const heap = new Array<ClientLink>();
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


function test(g: ClientGraph) {
    const FW = this.Floyd_Warhall(g, true);
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

function is_connected(g: ClientGraph): boolean {
    if (g.vertices.size < 2) {
        return true;
    }

    const indices = Array.from(g.vertices.keys());
    const visited = new Map();
    for (const index of g.vertices.keys()) {
        visited.set(index, false);
    }

    g.DFS_recursive( indices[0], visited);

    for (const is_visited of visited.values()) {
        if (!is_visited) {
            return false;
        }
    }
    return true;
}


// --------------------

