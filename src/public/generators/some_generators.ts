import { CanvasCoord } from "../board/coord";
import { Graph } from "../board/graph";
import { local_board } from "../setup";
import { Integer, Percentage } from "./attribute";
import { GraphGenerator } from "./generator";

// ----------------------------

 let generate_random_independent = new GraphGenerator("independent", [new Integer("n", 3)])

 generate_random_independent.generate = (pos: CanvasCoord) => {
    const graph = new Graph();
    const n = generate_random_independent.attributes[0].value;
    const r = 50;
    const center = local_board.view.serverCoord2(pos) 
    const cx = center.x; 
    const cy = center.y;
    for ( let i = 0 ; i < n ; i ++){
        graph.add_vertex(cx +  r*Math.cos( (2*Math.PI*i) /n), cy + r*Math.sin( (2*Math.PI*i) /n));
    }
    return graph;
}

// ----------------------------

 let random_clique = new GraphGenerator("clique", [new Integer("n", 3)])

 random_clique.generate = (pos: CanvasCoord) => {
    const graph = new Graph();
    const n = random_clique.attributes[0].value;
    const r = 50;
    const center = local_board.view.serverCoord2(pos) 
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

 let random_GNP = new GraphGenerator("gnp", [new Integer("n", 3), new Percentage("p")]);

 random_GNP.generate = (pos: CanvasCoord) => {
    const graph = new Graph();
    const n = random_GNP.attributes[0].value;
    const p = random_GNP.attributes[1].value;
    const center = local_board.view.serverCoord2(pos) 
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


let random_star = new GraphGenerator("star", [new Integer("n", 3)])

random_star.generate = (pos: CanvasCoord) => {
   const graph = new Graph();
   const n = random_star.attributes[0].value;
   const r = 50;
   const center = local_board.view.serverCoord2(pos) 
   const cx = center.x; 
   const cy = center.y;

    if(n>0){
        graph.add_vertex(cx, cy);
        for ( let i = 0 ; i < n ; i ++){
            graph.add_vertex(cx +  r*Math.cos( (2*Math.PI*i) /(n-1)), cy + r*Math.sin( (2*Math.PI*i) /(n-1)));
            graph.add_edge(0,i);
        }
    }

   return graph;
}

// ----------------------------

let complete_bipartite = new GraphGenerator("complete_bipartite", [new Integer("n",1),new Integer("m",1)]);

complete_bipartite.generate = (pos: CanvasCoord) => {
    const graph = new Graph();
    const n = complete_bipartite.attributes[0].value;
    const m = complete_bipartite.attributes[1].value;
    const center = local_board.view.serverCoord2(pos) 
    console.log(n, m);

    for ( let i = 0 ; i < n ; i ++){
        graph.add_vertex(center.x + i*30 , center.y);
    }
    for ( let j = 0 ; j < m ; j ++){
        graph.add_vertex(center.x + j*30 , center.y+100);
    }

    for ( let i = 0 ; i < n ; i ++){
        for ( let j = 0 ; j < m ; j ++){
            graph.add_edge(i,n+j);
        }
    }
    return graph;
}


// ----------------------------


// ----------------------------

let grid = new GraphGenerator("grid", [new Integer("n (column)",1),new Integer("m (row)",1)]);

grid.generate = (pos: CanvasCoord) => {
    const graph = new Graph();
    const n = grid.attributes[0].value;
    const m = grid.attributes[1].value;
    const center = local_board.view.serverCoord2(pos);
    
    for ( let i = 0 ; i < n ; i++){
        for ( let j = 0 ; j < m ; j ++){
            graph.add_vertex(center.x + i*30 , center.y+j*30);
        }
    }
   

    for ( let i = 0 ; i < n ; i ++){
        for ( let j = 0 ; j < m ; j ++){
            let current_index = i*m + j;
            if(j < m - 1){
                graph.add_edge(current_index, current_index + 1);
            }
            if(i<n-1){
                graph.add_edge(current_index, current_index+m);
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
generators_available.push(random_star);
generators_available.push(complete_bipartite);
generators_available.push(grid);

