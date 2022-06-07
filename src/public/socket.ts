import { io } from "socket.io-client";
import { Graph } from "../server/graph";
import { Vertex } from "../server/vertex";
import { Edge } from "../server/edge";
import { draw } from "./draw";
export const socket = io("http://localhost:5000")

export function setup_socket(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    socket.on('graph', (new_graph: Graph, vertices_entries: [number, Vertex][]) => {
        console.log("I get a new graph");
        g.edges = new Array();
        for (let edge of new_graph.edges) {
            let new_edge = new Edge(edge.start_vertex, edge.end_vertex);
            new_edge.copy_from(edge);
            g.edges.push(new_edge);
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
}