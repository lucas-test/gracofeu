
import { Graph, ORIENTATION } from '../local_graph';
import { Parametor } from './parametor';

export let param_nb_vertices = new Parametor("Vertices number");

param_nb_vertices.compute = ((g: Graph) => {
    return String(g.vertices.size)
})

export let param_nb_edges = new Parametor("Edges number");

param_nb_edges.compute = ((g: Graph) => {
    let counter = 0;
    for (var link of g.links.values()) {
        if (link.orientation == ORIENTATION.UNDIRECTED) {
            counter++;
        }
    }
    return String(counter);
})
