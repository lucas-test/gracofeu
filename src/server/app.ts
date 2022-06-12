import express from 'express';
import { Graph } from './graph';
import ENV from './.env.json';

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
the_graph.add_edge(0, 1);
the_graph.add_edge(1, 2);
the_graph.add_edge(2, 3);
the_graph.add_edge(3, 0);
room_graphs.set(the_room, the_graph);





io.sockets.on('connection', function (client) {

    // INIT NEW PLAYER
    console.log("connection from ", client.id);
    client.emit('myId', client.id, Date.now());

    // ROOM CREATION

    let room_id = makeid(5);
    client.join(room_id);
    clientRooms[client.id] = room_id;
    client.emit('room_id', room_id); // useless ? TODO remove
    console.log("new room : ", room_id);
    let g = new Graph();
    g.add_vertex(200, 100);
    room_graphs.set(room_id, g);
    io.sockets.in(room_id).emit('graph', g, [...g.vertices.entries()]);

    if (ENV.mode == "dev") {
        room_id = the_room;
        client.join(room_id);
        g = the_graph;
        clientRooms[client.id] = room_id;
        client.emit('graph', g, [...g.vertices.entries()]);
    }


    // SETUP NON GRAPH ACTIONS
    client.on('message', handleSalut);
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
            client.emit('graph', g, [...g.vertices.entries()]);
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
        client.to(room_id).emit('update_user', client.id, client.id.substring(0, 5), "white", x, y);
    }


    function handleSalut(message: any) {
        console.log(message)
    }

    // GRAPH API
    client.on('save_pos', handle_save_pos);
    client.on('update_pos_from_old', handle_update_pos_from_old); //TODO : remove
    client.on('add_vertex', (x: number, y: number, callback) => { callback(handle_add_vertex(x, y)) });
    client.on('add_edge', handle_add_edge);
    client.on('select_vertex', handle_select_vertex); // TODO : Remove
    client.on('update_position', handle_update_pos);
    client.on('update_positions', handle_update_positions);


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


    function handle_select_vertex(vertex_index: number) {
        g.select_vertex(vertex_index);
        io.sockets.in(room_id).emit('graph', g, [...g.vertices.entries()]);
    }

    function handle_save_pos(vertexIndex: number) {
        let vertex = g.vertices.get(vertexIndex);
        vertex.save_pos();
        io.sockets.in(room_id).emit('graph', g, [...g.vertices.entries()]);
    }

    function handle_update_pos_from_old(vertexIndex: number, x: number, y: number) {
        let vertex = g.vertices.get(vertexIndex);
        vertex.update_pos_from_old(x, y);
        io.sockets.in(room_id).emit('update_vertex_position', vertexIndex, vertex.pos.x, vertex.pos.y);
    }

    function handle_add_vertex(x: number, y: number) {
        let index = g.add_vertex(x, y);
        io.sockets.in(room_id).emit('graph', g, [...g.vertices.entries()]);
        return index;
    }

    function handle_add_edge(vindex: number, windex: number) {
        g.add_edge(vindex, windex);
        io.sockets.in(room_id).emit('graph', g, [...g.vertices.entries()]);
    }
})






