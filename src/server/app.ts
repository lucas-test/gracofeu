import express from 'express';

const port = process.env.PORT || 5000
const app = express();
const server = require('http').createServer(app).listen(port);
const io = require('socket.io')(server)
app.use(express.static('dist/public'));
app.get('/', function (req, res) { res.sendFile('index.html') })
console.log('Server started at http://localhost:' + port);


// gestion des rooms
/*
par room crée un graphe

*/

import { Graph } from './graph';

import { Coord } from './coord';
import { socket } from '../public/socket';

// TEMPORAIRE pour les tests
var the_graph = new Graph();
the_graph.add_vertex(100, 100);
the_graph.add_vertex(300, 200);
the_graph.add_edge(0, 1);



io.sockets.on('connection', function (client) {

    // INIT NEW PLAYER
    console.log("connection from ", client.id);
    client.emit('myId', client.id, Date.now());
    client.emit('graph', the_graph, [...the_graph.vertices.entries()]);

    // emitRoomsAvailable() TODO

    // SETUP NON GRAPH ACTIONS
    client.on('message', handleSalut);
    client.on('moving_cursor', update_user);

    function update_user(x: number, y: number) {
        client.broadcast.emit('update_user', client.id, client.id.substring(0, 5), "white", x, y);
    }


    function handleSalut(message: any) {
        console.log(message)
    }

    // GRAPH API
    client.on('save_pos', handle_save_pos);
    client.on('update_pos_from_old', handle_update_pos_from_old);
    client.on('add_vertex', (x: number, y: number, callback) => { callback(handle_add_vertex(x, y)) });
    client.on('add_edge', handle_add_edge);
    client.on('select_vertex', handle_select_vertex);





    function handle_select_vertex(vertex_index: number) {
        the_graph.select_vertex(vertex_index);
        io.emit('graph', the_graph, [...the_graph.vertices.entries()]);
    }

    function handle_save_pos(vertexIndex: number) {
        let vertex = the_graph.vertices.get(vertexIndex);
        vertex.save_pos();
        io.emit('graph', the_graph, [...the_graph.vertices.entries()]);
    }

    function handle_update_pos_from_old(vertexIndex: number, x: number, y: number) {
        let vertex = the_graph.vertices.get(vertexIndex);
        vertex.update_pos_from_old(x, y);
        io.emit('update_vertex_position', vertexIndex, vertex.pos.x, vertex.pos.y);
    }

    function handle_add_vertex(x: number, y: number) {
        let index = the_graph.add_vertex(x, y);
        io.emit('graph', the_graph, [...the_graph.vertices.entries()]);
        return index;
    }

    function handle_add_edge(vindex: number, windex: number) {
        the_graph.add_edge(vindex, windex);
        io.emit('graph', the_graph, [...the_graph.vertices.entries()]);
    }
})




