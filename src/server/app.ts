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

var the_graph = new Graph();




io.sockets.on('connection', function (client) {

    // INIT NEW PLAYER
    console.log("connection from ", client.id);
    client.emit('myId', client.id, Date.now());
    // emitRoomsAvailable()

    // SETUP ACTIONS
    client.on('message', handleSalut);
    client.on('createVertex', handleCreateVertex);
    client.on('moveVertex', handleMoveVertex);


    function handleSalut(message: any){
        console.log(message)
        console.log("salut ", the_graph);
    }

    function handleCreateVertex(vertexIndex: number){

    }


    function handleMoveVertex(vertexIndex: number, new_pos: Coord){
        
    }
})


