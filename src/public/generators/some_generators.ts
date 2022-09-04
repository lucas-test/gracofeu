import { Graph } from "../board/graph";
import { Integer, Percentage } from "./attribute";
import { mouse_position_at_generation } from "./dom";
import { GraphGenerator } from "./generator";

 let generate_random_independent = new GraphGenerator("independent", [new Integer("n")])

 let random_clique = new GraphGenerator("clique", [new Integer("n")])

 random_clique.generate = () => {
    const graph = new Graph();
    const n = random_clique.attributes[0].value;
    const r = 50;
    const cx = mouse_position_at_generation.x; // todo attention cx c'est servercoord, mouse canvascoord
    const cy = mouse_position_at_generation.y;
    for ( let i = 0 ; i < n ; i ++){
        graph.add_vertex(cx +  r*Math.cos( (2*Math.PI*i) /n), cy + r*Math.sin( (2*Math.PI*i) /n));
        for ( let j = 0 ; j < i ; j ++ ){
            graph.add_edge(j,i);
        }
    }
    return graph;
 }

 let random_GNP = new GraphGenerator("gnp", [new Integer("n"), new Percentage("p")])

export let generators_available = new Array<GraphGenerator>();
generators_available.push(generate_random_independent);
generators_available.push(random_clique);
generators_available.push(random_GNP);

