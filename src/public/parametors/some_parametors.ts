
import { Graph, LocalVertex, ORIENTATION } from '../board/local_graph';
import { Parametor, SENSIBILITY } from './parametor';

export let param_nb_vertices = new Parametor("Vertices number", "vertex_number", true, false, [SENSIBILITY.ELEMENT]);

param_nb_vertices.compute = ((g: Graph) => {
    return String(g.vertices.size)
})


export let param_nb_edges = new Parametor("Edges number", "edge_number", true, false, [SENSIBILITY.ELEMENT]);

param_nb_edges.compute = ((g: Graph) => {
    let counter = 0;
    for (var link of g.links.values()) {
        if (link.orientation == ORIENTATION.UNDIRECTED) {
            counter++;
        }
    }
    return String(counter);
})



export let param_is_connected = new Parametor("Is connected?", "is_connected", false, true, [SENSIBILITY.ELEMENT]);

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

export let param_number_colors = new Parametor("Number vertex colors", "nb_vertex_colors", true, false, [SENSIBILITY.ELEMENT, SENSIBILITY.COLOR]);

param_number_colors.compute = ((g: Graph) =>{
    let colors_set = new Set<string>();
    for(const v of g.vertices.values())
    {
        colors_set.add(v.color);
    }
    return String(colors_set.size);

});


export let param_number_geo = new Parametor("GEO", "geo", true, false, [SENSIBILITY.ELEMENT, SENSIBILITY.GEOMETRIC]);

param_number_geo.compute = ((g: Graph) =>{
    let n = 0;
    for(const v of g.vertices.values())
    {
        n += v.pos.x > 0?0:1;
    }
    return String(n);

});



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