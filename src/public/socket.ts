import { io } from "socket.io-client";
import { draw, draw_circle, draw_vertex } from "./draw";
import { update_user_list_div, User, users } from "./user";
import { Coord, Graph, Link, LocalVertex, ORIENTATION, ServerCoord } from "./local_graph";
import { view } from "./camera";
import { Stroke } from "./stroke";
export const socket = io()

export function setup_socket(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {

    // USERS
    socket.on('myId', handle_my_id);
    socket.on('update_user', update_user);
    socket.on('remove_user', remove_user);
    // socket.on('clients', handle_clients);



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
            users.get(id).set_pos(x,y);
        }
        else {
            users.set(id, new User(label, color, new ServerCoord(x, y)));
            update_user_list_div();
        }
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }


    function remove_user(userid: string) {
        users.delete(userid);
        update_user_list_div();
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }

    
    // function handle_clients(users_entries){
    //     users.clear();
    //     for (const data of users_entries) {
    //         const new_user = new User(data[1].label, data[1].color, new ServerCoord(-10, -10));
    //         users.set(data[0], new_user);
    //     }
    // }

    socket.on('strokes', handle_strokes);

    function handle_strokes(data){
        // console.log(data);
        g.strokes.clear();
        for(const s of data){
            const positions = [];
            s[1].positions.forEach(e => {
                positions.push(new ServerCoord(e.x, e.y));
            });
            const new_stroke = new Stroke(positions, s[1].color, s[1].width);
            g.strokes.set(s[0], new_stroke);
        }
    }

    // GRAPH 
    socket.on('update_vertex_position', update_vertex_position);
    socket.on('update_vertex_positions', update_vertex_positions);
    socket.on('update_control_point', handle_update_control_point);
    socket.on('update_control_points', handle_update_control_points);

    function handle_update_control_points(data) {
        for (const e of data) {
            if (g.links.has(e.index)) {
                const link = g.links.get(e.index);
                link.cp.x = e.cp.x;
                link.cp.y = e.cp.y;
                link.canvas_cp = view.canvasCoord(link.cp);
            }
        }
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }

    function handle_update_control_point(index: number, c: Coord) {
        const link = g.links.get(index);
        link.cp.x = c.x;
        link.cp.y = c.y;
        link.canvas_cp = view.canvasCoord(link.cp);
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }

    socket.on('graph', (vertices_entries, links_entries) => {
        console.log("I get a new graph");

        // pour les vertices_entries c'est parce que on peut pas envoyer des Map par socket ...
        // edges = new_graph.edges marche pas car bizarrement ça ne copie pas les méthodes ...

        g.vertices.clear();
        for (const data of vertices_entries) {
            const new_vertex = new LocalVertex(data[1].pos);
            new_vertex.color = data[1].color;
            g.vertices.set(data[0], new_vertex);
        }

        g.links.clear();
        for (const data of links_entries) {
            let orient = ORIENTATION.UNDIRECTED;
            switch (data[1].orientation) {
                case "UNDIRECTED":
                    orient = ORIENTATION.UNDIRECTED
                    break;
                case "DIRECTED":
                    orient = ORIENTATION.DIRECTED
                    break;
                case "DIGON":
                    orient = ORIENTATION.DIGON
                    break;
            }
            const new_link = new Link(data[1].start_vertex, data[1].end_vertex, data[1].cp, orient);
            g.links.set(data[0], new_link);
        }

        g.compute_vertices_index_string();

        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    })





    function update_vertex_position(index: number, x: number, y: number) {
        const v = g.vertices.get(index);
        v.pos.x = x;
        v.pos.y = y;
        v.canvas_pos = view.canvasCoord(v.pos);
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }



    function update_vertex_positions(data) {
        for (const e of data) {
            const v = g.vertices.get(e.index);
            v.pos.x = e.x;
            v.pos.y = e.y;
            v.canvas_pos = view.canvasCoord(v.pos);
        }
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }





}

