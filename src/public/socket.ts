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
    socket.on("delete_selected_vertices", handle_delete_selected_vertices);

    socket.on('graph', (new_graph, vertices_entries) => {
        console.log("I get a new graph");

        // pour les vertices_entries c'est parce que on peut pas envoyer des Map par socket ...
        // edges = new_graph.edges marche pas car bizarrement ça ne copie pas les méthodes ...
        g.edges = new Array();
        for (let edge of new_graph.edges) {
            let new_edge = new Edge(edge.start_vertex, edge.end_vertex);
            g.edges.push(new_edge);
        }

        g.vertices = new Map();
        for (let data of vertices_entries) {
            let new_vertex = new LocalVertex(data[1].pos);
            g.vertices.set(data[0], new_vertex);
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


  
    function handle_delete_selected_vertices(data) {
        for (const e of data) {
            if(g.vertices.has(e.index)){
                g.vertices.delete(e.index);
            }

            for(let i = g.edges.length - 1; i>=0; i--){
                const edge = g.edges[i];
                if(edge.end_vertex === e.index || edge.start_vertex === e.index){
                    g.edges.splice(i, 1);
                }
            }

            // for(let i = g.arcs.length - 1; i>=0; i--){
            //     const arc = g.arcs[i];
            //     if(arc.end_vertex === e.index || arc.start_vertex === e.index){
            //         g.arcs.splice(i, 1);
            //     }
            // }

            requestAnimationFrame(function () { draw(canvas, ctx, g) });


        }
    }


}
