import { io } from "socket.io-client";
import { draw, draw_circle, draw_vertex } from "./draw";
import { User, users } from "./user";
import { Coord, Edge, Graph, LocalVertex } from "./local_graph";
export const socket = io()

export function setup_socket(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {

    // USERS
    socket.on('myId', handle_my_id);
    socket.on('update_user', update_user);
    socket.on('remove_user', remove_user);



    function handle_my_id(id: string) {
        let url = new URL(document.URL);
        let urlsp = url.searchParams;
        let room_id = encodeURI(urlsp.get("room_id"));
        if (room_id != "null") {
            console.log("room_id : ", room_id);
            socket.emit("change_room_to", room_id);
        }
    }

    function update_user(id: string, label: string, color: string, x: number, y: number) {
        if (users.has(id)) {
            users.get(id).pos = new Coord(x, y);
        }
        else {
            users.set(id, new User(label, color, new Coord(x, y)));
        }
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }


    function remove_user(userid: string) {
        users.delete(userid);
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }


    // GRAPH 
    socket.on('update_vertex_position', update_vertex_position);
    socket.on('update_vertex_positions', update_vertex_positions);
    socket.on('update_control_point', handle_update_control_point);
    socket.on('update_control_points', handle_update_control_points);

    function handle_update_control_points(data){
        for (const e of data) {
            if ( g.edges.has(e.index)){
                const edge = g.edges.get(e.index);
                edge.cp.x = e.cp.x;
                edge.cp.y = e.cp.y;
            }
        }
    }

    function handle_update_control_point(index: number, c: Coord){
        const edge = g.edges.get(index);
        edge.cp.x = c.x;
        edge.cp.y = c.y;
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }

    socket.on('graph', (vertices_entries, edges_entries) => {
        console.log("I get a new graph");

        // pour les vertices_entries c'est parce que on peut pas envoyer des Map par socket ...
        // edges = new_graph.edges marche pas car bizarrement ça ne copie pas les méthodes ...

        g.vertices.clear();
        for (const data of vertices_entries) {
            const new_vertex = new LocalVertex(data[1].pos);
            g.vertices.set(data[0], new_vertex);
        }

        g.edges.clear();
        for (const data of edges_entries) {
            const new_edge = new Edge(data[1].start_vertex, data[1].end_vertex, data[1].cp);
            g.edges.set(data[0], new_edge);
        }

        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    })





    function update_vertex_position(index: number, x: number, y: number) {
        const v = g.vertices.get(index);
        v.pos.x = x;
        v.pos.y = y;
    }



    function update_vertex_positions(data) {
        for (const e of data) {
            const v = g.vertices.get(e.index);
            v.pos.x = e.x;
            v.pos.y = e.y;
        }
    }





}
