import express from 'express';
import { Graph } from './graph';
import ENV from './.env.json';
import { Vertex } from './vertex';
import { User, users } from './user';
import { Coord } from './coord';
import { ORIENTATION } from './link';

const port = process.env.PORT || 5000
const app = express();
const server = require('http').createServer(app).listen(port);
const io = require('socket.io')(server)
app.use(express.static('dist/public'));
app.get('/', function (req, res) { res.sendFile('index.html') })
console.log('Server started at http://localhost:' + port);


// gestion des rooms

const room_graphs = new Map<string, Graph>();
const clientRooms = {};

function makeid(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}



const the_room = "theroom";
const the_graph = new Graph();
the_graph.add_vertex(300, 300);
the_graph.add_vertex(200, 300);
the_graph.add_vertex(200, 200);
the_graph.add_vertex(300, 200);
the_graph.add_link(0, 1, ORIENTATION.UNDIRECTED);
the_graph.add_link(1, 2, ORIENTATION.UNDIRECTED);
the_graph.add_link(2, 3, ORIENTATION.UNDIRECTED);
the_graph.add_link(3, 0, ORIENTATION.UNDIRECTED);
room_graphs.set(the_room, the_graph);





io.sockets.on('connection', function (client) {

    // INIT NEW PLAYER
    console.log("connection from ", client.id);
    client.emit('myId', client.id, Date.now());
    const user_data = new User(client.id);
    users.set(client.id, user_data);


    // ROOM CREATION

    let room_id = makeid(5);
    client.join(room_id);
    clientRooms[client.id] = room_id;
    client.emit('room_id', room_id); // useless ? TODO remove
    console.log("new room : ", room_id);
    let g = new Graph();
    g.add_vertex(200, 100);
    room_graphs.set(room_id, g);
    emit_graph_to_room()

    if (ENV.mode == "dev") {
        room_id = the_room;
        client.join(room_id);
        g = the_graph;
        clientRooms[client.id] = room_id;
        emit_graph_to_client()
    }

    function emit_graph_to_client() {
        client.emit('graph', [...g.vertices.entries()], [...g.links.entries()]);
    }

    function emit_graph_to_room() {
        io.sockets.in(room_id).emit('graph', [...g.vertices.entries()], [...g.links.entries()]);
    }


    // SETUP NON GRAPH ACTIONS
    client.on('moving_cursor', update_user);
    client.on('disconnect', handle_disconnect);
    client.on('change_room_to', handle_change_room_to);
    client.on('get_room_id', (callback) => { callback(handle_get_room_id()) });

    function handle_get_room_id() {
        return room_id;
    }

    function handle_change_room_to(new_room_id: string) {
        if (room_graphs.has(new_room_id)) {
            client.join(new_room_id);
            clientRooms[client.id] = new_room_id;
            room_id = new_room_id;
            g = room_graphs.get(room_id);
            emit_graph_to_client();
            console.log(clientRooms);
        }
        else {
            console.log("asked room does not exist")
        }
    }

    function handle_disconnect() {
        io.sockets.in(room_id).emit('remove_user', client.id);
    }

    function update_user(x: number, y: number) {
        client.to(room_id).emit('update_user', client.id, user_data.name, user_data.color, x, y);
    }



    // GRAPH API

    client.on('add_vertex', (x: number, y: number, callback) => { callback(handle_add_vertex(x, y)) });
    client.on('add_link', handle_add_link);
    client.on('update_position', handle_update_pos);
    client.on('update_positions', handle_update_positions);
    client.on('delete_selected_elements', handle_delete_selected_elements);
    client.on('get_json', handle_get_json);
    client.on('load_json', handle_load_json);
    client.on('update_control_point', handle_update_control_point);
    client.on('update_control_points', handle_update_control_points);

    function handle_update_control_points(data) {
        for (const element of data) {
            if (g.links.has(element.index)) {
                const link = g.links.get(element.index);
                link.cp.x = element.cp.x;
                link.cp.y = element.cp.y;
            }
        }
        client.in(room_id).emit('update_control_points', data);
    }

    function handle_update_control_point(link_index: number, c: Coord) {
        if (g.links.has(link_index)) {
            const link = g.links.get(link_index);
            link.cp.x = c.x;
            link.cp.y = c.y;
            io.sockets.in(room_id).emit('update_control_point', link_index, c);
        }
    }

    function handle_load_json(s: string) {
        g.clear();

        const data = JSON.parse(s);
        for (const vdata of data.vertices) {
            const new_vertex = new Vertex(vdata[1]["pos"]["x"], vdata[1]["pos"]["y"]);
            g.vertices.set(vdata[0], new_vertex)
        }
        for (const link of data.links) {
            g.add_link_with_cp(link[1].start_vertex, link[1].end_vertex, link[1].orientation, new Coord(link[1].cp.x, link[1].cp.y))
        }
        emit_graph_to_room();
    }

    function handle_get_json(callback) {
        const graph_stringifiable = {
            vertices: Array.from(g.vertices.entries()),
            links: Array.from(g.links.entries()),
        }
        callback(JSON.stringify(graph_stringifiable));
    }

    function handle_delete_selected_elements(data) {
        for (const e of data) {
            if (e.type == "vertex") {
                g.delete_vertex(e.index);
            }
            else if (e.type == "link") {
                g.delete_link(e.index);
            }
        }
        emit_graph_to_room();
    }

    function handle_update_pos(vertexIndex: number, x: number, y: number) {
        let vertex = g.vertices.get(vertexIndex);
        vertex.pos.x = x;
        vertex.pos.y = y;
        io.sockets.in(room_id).emit('update_vertex_position', vertexIndex, vertex.pos.x, vertex.pos.y);
    }

    function handle_update_positions(data) {
        for (const e of data) {
            let vertex = g.vertices.get(e.index);
            vertex.pos.x = e.x;
            vertex.pos.y = e.y;
        }
        io.sockets.in(room_id).emit('update_vertex_positions', data);
    }







    function handle_add_vertex(x: number, y: number) {
        let index = g.add_vertex(x, y);
        emit_graph_to_room();
        return index;
    }

    function handle_add_link(vindex: number, windex: number, orientation: string) {
        let orient = ORIENTATION.UNDIRECTED;
        switch(orientation){
            case "undirected":
                orient = ORIENTATION.UNDIRECTED
            case "directed":
                orient = ORIENTATION.DIRECTED
            case "digon":
                orient = ORIENTATION.DIGON
        }
        g.add_link(vindex, windex, orient);
        
        emit_graph_to_room();
    }
})














