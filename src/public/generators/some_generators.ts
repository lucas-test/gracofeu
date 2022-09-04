import { Graph } from "../board/graph";
import { local_board } from "../setup";
import { Integer, Percentage } from "./attribute";
import { mouse_position_at_generation } from "./dom";
import { GraphGenerator } from "./generator";

// ----------------------------

 let generate_random_independent = new GraphGenerator("independent", [new Integer("n")])

 generate_random_independent.generate = () => {
    const graph = new Graph();
    const n = generate_random_independent.attributes[0].value;
    const r = 50;
    const center = local_board.view.serverCoord2(mouse_position_at_generation) 
    const cx = center.x; 
    const cy = center.y;
    for ( let i = 0 ; i < n ; i ++){
        graph.add_vertex(cx +  r*Math.cos( (2*Math.PI*i) /n), cy + r*Math.sin( (2*Math.PI*i) /n));
    }
    return graph;
}

// ----------------------------

 let random_clique = new GraphGenerator("clique", [new Integer("n")])

 random_clique.generate = () => {
    const graph = new Graph();
    const n = random_clique.attributes[0].value;
    const r = 50;
    const center = local_board.view.serverCoord2(mouse_position_at_generation) 
    const cx = center.x; 
    const cy = center.y;
    for ( let i = 0 ; i < n ; i ++){
        graph.add_vertex(cx +  r*Math.cos( (2*Math.PI*i) /n), cy + r*Math.sin( (2*Math.PI*i) /n));
        for ( let j = 0 ; j < i ; j ++ ){
            graph.add_edge(j,i);
        }
    }
    return graph;
 }

 // ----------------------------

 let random_GNP = new GraphGenerator("gnp", [new Integer("n"), new Percentage("p")]);

 random_GNP.generate = () => {
    const graph = new Graph();
    const n = random_GNP.attributes[0].value;
    const p = random_GNP.attributes[1].value;
    const center = local_board.view.serverCoord2(mouse_position_at_generation) 
    const cx = center.x; 
    const cy = center.y;
    const r = 50;
    for ( let i = 0 ; i < n ; i ++){
        graph.add_vertex(cx +  r*Math.cos( (2*Math.PI*i) /n), cy + r*Math.sin( (2*Math.PI*i) /n));
        for ( let j = 0 ; j < i ; j ++ ){
            if ( Math.random() < p){
                graph.add_edge(j,i);
            }
            
        }
    }

    return graph;
 }

// ----------------------------

export let generators_available = new Array<GraphGenerator>();
generators_available.push(generate_random_independent);
generators_available.push(random_clique);
generators_available.push(random_GNP);

