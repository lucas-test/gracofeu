import { io } from "socket.io-client";
import { Graph } from "../server/graph";
import { Vertex } from "../server/vertex";
import { Edge } from "../server/edge";
import { draw, draw_circle, draw_vertex } from "./draw";
import { Arc } from "../server/arc";
import { camera } from "./camera";
import { User, users } from "./user";
import { Coord } from "../server/coord";
export const socket = io()

export function setup_socket(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    socket.on('graph', (new_graph: Graph, vertices_entries: [number, Vertex][]) => {
        console.log("I get a new graph");

        // pour les vertices_entries c'est parce que on peut pas envoyer des Map par socket ...
        // g.edges = new_graph.edges marche pas car bizarrement ça ne copie pas les méthodes ...
        g.edges = new Array();
        for (let edge of new_graph.edges) {
            let new_edge = new Edge(edge.start_vertex, edge.end_vertex);
            new_edge.copy_from(edge);
            g.edges.push(new_edge);
        }

        g.arcs = new Array();
        for (let arc of new_graph.arcs) {
            let new_arc = new Arc(arc.start_vertex, arc.end_vertex);
            new_arc.copy_from(arc);
            g.arcs.push(new_arc);
        }

        g.vertices = new Map();
        for (let data of vertices_entries) {
            let new_vertex = new Vertex(data[1].pos.x, data[1].pos.y);
            new_vertex.old_pos = data[1].old_pos;
            new_vertex.selected = data[1].selected;
            g.vertices.set(data[0], new_vertex)
        }

        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    })


    socket.on('update_user', update_user);

    function update_user(id:string, label:string, color:string, x:number, y:number){
       if(users.has(id)){
           users.get(id).pos = new Coord(x, y);
       }
       else{
           users.set(id, new User(label, color, new Coord(x, y)));
       }
       requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }

    socket.on('update_vertex_position', update_vertex_position);

    function update_vertex_position(index:number, x:number, y:number){
        const v = g.vertices.get(index); 
        v.pos.x = x;
        v.pos.y = y; 
    }
}
