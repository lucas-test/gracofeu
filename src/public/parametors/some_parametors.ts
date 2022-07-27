
import { ORIENTATION } from '../board/link';
import { Graph } from '../board/graph';
import { Parametor, SENSIBILITY } from './parametor';

export let param_nb_vertices = new Parametor("Vertices number", "vertex_number", "#vertices", "Print the number of vertices", true, false, [SENSIBILITY.ELEMENT]);

param_nb_vertices.compute = ((g: Graph) => {
    return String(g.vertices.size)
})


export let param_nb_edges = new Parametor("Edges number", "edge_number", "#edges", "Print the number of edges", true, false, [SENSIBILITY.ELEMENT]);

param_nb_edges.compute = ((g: Graph) => {
    let counter = 0;
    for (var link of g.links.values()) {
        if (link.orientation == ORIENTATION.UNDIRECTED) {
            counter++;
        }
    }
    return String(counter);
})



export let param_is_connected = new Parametor("Is connected?", "is_connected","is connected?", "Is the graph/area connected?", false, true, [SENSIBILITY.ELEMENT]);

param_is_connected.compute = ((g: Graph) =>{

    if(g.vertices.size < 2){
        return "true";
    }

    const indices = Array.from(g.vertices.keys());
    const visited = new Map();
    for(const index of g.vertices.keys()){
        visited.set(index, false);
    }

    DFS_recursive(g, indices[0], visited);

    for(const is_visited of visited.values()){
        if(! is_visited)
        {
            return "false";
        }
    }
    return "true";
});



export let param_number_connected_comp = new Parametor("Number connected component", "number_connected_comp", "#connected comp.", "Compute the number of connected component (undirected)", false, false, [SENSIBILITY.ELEMENT]);

param_number_connected_comp.compute = ((g: Graph) =>{

    if(g.vertices.size < 1){
        return "0";
    }
    const visited = new Map();
    for(const index of g.vertices.keys()){
        visited.set(index, false);
    }

    let cc = 0;
    let all_visited = false;

    while(!all_visited){
        all_visited = true;
        let first_vertex_index; 

        for (const index of g.vertices.keys()) {
            if(visited.get(index) === false){
                first_vertex_index = index;
                all_visited = false;
                cc++; 
                break;
            }
        }

        if(all_visited)
        {
            break;
        }

        DFS_recursive(g, first_vertex_index, visited);

    }
    return String(cc);
});


export let param_number_colors = new Parametor("Number vertex colors", "nb_vertex_colors", "#colors (vertices)", "Print the number of different colors used on the vertices", true, false, [SENSIBILITY.ELEMENT, SENSIBILITY.COLOR]);

param_number_colors.compute = ((g: Graph) =>{
    let colors_set = new Set<string>();
    for(const v of g.vertices.values())
    {
        colors_set.add(v.color);
    }
    return String(colors_set.size);

});


export let param_number_geo = new Parametor("GEO", "geo", "geo", "just a test. to remove", true, false, [SENSIBILITY.ELEMENT, SENSIBILITY.GEOMETRIC]);

param_number_geo.compute = ((g: Graph) =>{
    let n = 0;
    for(const v of g.vertices.values())
    {
        n += v.pos.x > 0?0:1;
    }
    return String(n);

});



export let param_min_degree = new Parametor("Minimum degree", "min_degree", "min degree", "Print the minimum degree", true, false, [SENSIBILITY.ELEMENT]);

param_min_degree.compute = ((g: Graph) =>{
    const data = get_degrees_data(g);
    return String(data.min_value);
});


export let param_max_degree = new Parametor("Maximum degree", "max_degree", "max degree", "Print the minimum degree", true, false, [SENSIBILITY.ELEMENT]);

param_max_degree.compute = ((g: Graph) =>{
    const data = get_degrees_data(g);
    return String(data.max_value);
});

export let param_average_degree = new Parametor("Average degree", "avg_degree", "avg. degree", "Print the average degree", true, false, [SENSIBILITY.ELEMENT]);

param_average_degree.compute = ((g: Graph) =>{
    // Remark : If no loop, we can simply use that sum(degree) = 2|E| so avg(degree) = 2|E|/|V|
    const data = get_degrees_data(g);
    const avg = Math.round((data.avg + Number.EPSILON) * 100) / 100

    return String(avg);
});


export let param_has_proper_coloring = new Parametor("Proper vertex-coloring?", "has_proper_coloring", "proper vertex-coloring?","Print if the current coloring of the vertices is proper or not", false, true, [SENSIBILITY.ELEMENT, SENSIBILITY.COLOR]);

param_has_proper_coloring.compute = ((g: Graph) =>{

    if(g.vertices.size == 0){
        return "true";
    }

    const visited = new Map();
    for(const index of g.vertices.keys()){
        visited.set(index, false);
    }

    const v_index = g.vertices.keys().next().value;

    const S = Array();
    S.push(v_index);

    while(S.length !== 0){
        const v_index = S.pop();
        if(!visited.get(v_index)){
            visited.set(v_index, true);
            const v = g.vertices.get(v_index);
            const neighbors = g.get_neighbors_list(v_index);
            for(const u_index of neighbors){
                const u = g.vertices.get(u_index);
                if(u.color === v.color){
                    return "false";
                }
                S.push(u_index);
            }
        }
    }

    return "true";

});




function get_degrees_data(g:Graph){
    if(g.vertices.size == 0){
        return {min_value:0, min_vertices:null, max_value:0, max_vertices:null, avg:0};
    }

    const index_first = g.vertices.keys().next().value;
    let min_indices = new Set([index_first]);
    let min_degree = g.get_neighbors_list(index_first).length;
    let max_indices = new Set([index_first]);
    let max_degree = g.get_neighbors_list(index_first).length;
    let average = 0.0;
    
    for(const v_index of g.vertices.keys())
    {
        const neighbors = g.get_neighbors_list(v_index);
        if(min_degree > neighbors.length){
            min_degree = neighbors.length;
            min_indices = new Set([v_index]);
        }
        if(min_degree === neighbors.length){
            min_indices.add(v_index);
        }

        if(max_degree < neighbors.length){
            max_degree = neighbors.length;
            max_indices = new Set([v_index]);
        }
        if(max_degree === neighbors.length){
            max_indices.add(v_index);
        }

        average+= neighbors.length;
    }

    average = average/g.vertices.size;

    return {min_value:min_degree, min_vertices:min_indices, max_value:max_degree, max_vertices:max_indices, avg:average};
}


function DFS_recursive(g:Graph, v_index : number, visited:Map<number, boolean>){
    visited.set(v_index, true);
    const neighbors = g.get_neighbors_list(v_index);

    for(const u_index of neighbors){
        if(visited.has(u_index) && !visited.get(u_index)){
            DFS_recursive(g, u_index, visited);
        }
    }
}

function DFS_iterative(g:Graph, v_index : number){
    const visited = new Map();
    for(const index of g.vertices.keys()){
        visited.set(index, false);
    }
    console.log(visited);

    const S = Array();
    S.push(v_index);

    while(S.length !== 0){
        const u_index = S.pop();
        if(!visited.get(u_index)){
            visited.set(u_index, true);
            const neighbors = g.get_neighbors_list(u_index);
            for(const n_index of neighbors){
                S.push(n_index);
            }
        }
    }

    return visited;
}