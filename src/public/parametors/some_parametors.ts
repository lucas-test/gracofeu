
import { Graph } from '../local_graph';
import { Parametor } from './parametor';

export let param_nb_vertices = new Parametor("Vertices number");

param_nb_vertices.compute = ((g: Graph) => {
    return String(g.vertices.size)
})

export let param_nb_edges = new Parametor("Edges number");

param_nb_edges.compute = ((g: Graph) => {
    return String(g.edges.size);
})
