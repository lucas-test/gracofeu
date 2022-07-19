import express from 'express';
import { Graph } from './graph';
import ENV from './.env.json';
import { Vertex } from './vertex';
import { getRandomColor, User, users } from './user';
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
    const user_data = new User(client.id, getRandomColor());
    users.set(client.id, user_data);
    client.emit('myId', user_data.id, user_data.label, user_data.color,  Date.now());


    // ROOM CREATION

    let room_id = makeid(5);
    client.join(room_id);
    clientRooms[client.id] = room_id;
    client.emit('room_id', room_id); // useless ? TODO remove
    console.log("new room : ", room_id);
    let g = new Graph();
    g.add_vertex(200, 100);
    room_graphs.set(room_id, g);
    emit_graph_to_room();
    emit_strokes_to_room();
    emit_areas_to_room();
    // emit_users_to_client();

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

    function emit_strokes_to_room(){
        io.sockets.in(room_id).emit('strokes', [...g.strokes.entries()]);
    }

    function emit_areas_to_room(){
        io.sockets.in(room_id).emit('areas', [...g.areas.entries()])
    }

    function emit_users_to_client(){
        if(client.id in clientRooms){
            const users_in_room =  get_other_clients_in_room(client.id,clientRooms);
            client.emit('clients', [...users_in_room.entries()]);
            // TODO: Corriger ca: on envoie le nouvel user à tous les users de la room, mais on n'a pas ses coordonnées donc ce sont de fausses coordonnées.
            client.to(room_id).emit('update_user', client.id, user_data.label, user_data.color, -100, -100);
        }
    }



    // SETUP NON GRAPH ACTIONS
    client.on('moving_cursor', update_user);
    client.on('disconnect', handle_disconnect);
    client.on('change_room_to', handle_change_room_to);
    client.on('get_room_id', (callback) => { callback(handle_get_room_id()) });
    client.on('update_self_user', handle_update_self_user);
    client.on('follow', add_follower);
    client.on('unfollow', remove_follower);
    client.on('my_view', send_view_to_followers);

    function handle_update_self_user(label:string, color:string){
        if(users.has(client.id)){
            users.get(client.id).color=color;
            users.get(client.id).label=label;
            client.to(room_id).emit('update_other_self_user', client.id, label, color);
        }
        else{
            console.log("Error, client not found", client.id);
        }
    }

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
            emit_strokes_to_room();
            emit_areas_to_room();
            emit_users_to_client();
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
        client.to(room_id).emit('update_user', client.id, user_data.label, user_data.color, x, y);
    }

    function add_follower(id:string){
        console.log("ADDING FOLLOWER...");
        if(users.has(client.id) && users.has(id)){
            users.get(id).followers.push(client.id);
            io.to(id).emit("send_view");
            
            console.log("ADDED!");
        }
    }

    function remove_follower(id:string){
        console.log("REMOVING FOLLOWER...");
        if(users.has(client.id) && users.has(id)){
            const index = users.get(id).followers.indexOf(client.id);
            if (index > -1) { 
                users.get(id).followers.splice(index, 1);
                console.log("REMOVED!");
            }
        }
    }

    function send_view_to_followers(x:number, y:number, zoom:number){
        // console.log("SEND VIEW TO FOLLOWERS:", x,y,zoom, client.id, users.get(client.id).followers);
        for(const user_id of users.get(client.id).followers){
            io.to(user_id).emit("view_follower", x, y, zoom, client.id);
        }
    }


    // ------------------------
    // GRAPH API
    // ------------------------

    client.on('add_vertex', (x: number, y: number, callback) => { callback(handle_add_vertex(x, y)) });
    client.on('add_link', handle_add_link);
    client.on('update_position', handle_update_pos);
    client.on('update_positions', handle_update_positions);
    client.on('delete_selected_elements', handle_delete_selected_elements);
    client.on('get_json', handle_get_json);
    client.on('load_json', handle_load_json);
    client.on('update_control_point', handle_update_control_point);
    client.on('update_control_points', handle_update_control_points);
    client.on('update_colors', handle_update_colors);
    client.on('add_stroke', handle_add_stroke);
    client.on('add_area', handle_add_area);
    client.on('area_move_side', handle_move_side_area);
    client.on('area_move_corner', handle_move_corner_area);


    // AREAS 
    function handle_add_area(c1x:number, c1y:number, c2x:number, c2y:number, label:string, color:string){
        g.add_area(new Coord(c1x, c1y), new Coord(c2x, c2y), label, color);
        emit_areas_to_room();
    }

    function handle_move_side_area(index:number, x:number, y:number, side_number){
        const area = g.areas.get(index);
        console.log(g.areas.get(index));
        switch(side_number){
            case 1:
                if(area.c1.y > area.c2.y){ area.c2.y = y; }
                else{  area.c1.y = y; }
                break;
            case 2:
                if(area.c1.x > area.c2.x){ area.c1.x = x; }
                else{ area.c2.x = x; }
                break;
            case 3:
                if(area.c1.y < area.c2.y){ area.c2.y = y; }
                else{ area.c1.y = y; }
                break;
            case 4:
                if(area.c1.x < area.c2.x){ area.c1.x = x; }
                else{ area.c2.x = x; }
                break;
            default:
                break;
        }

        g.areas.set(index, area);
        //TODO : update only one area
        emit_areas_to_room();
    }


    
    function handle_move_corner_area(index:number, x:number, y:number, corner_number){
        const area = g.areas.get(index);
        switch(corner_number){
            case 1:
                if(area.c1.x < area.c2.x){ area.c1.x = x; }
                else{ area.c2.x = x; }
                if(area.c1.y > area.c2.y){  area.c2.y = y; }
                else{ area.c1.y = y; }
                break;
            case 2:
                if(area.c1.x > area.c2.x){ area.c1.x = x; }
                else{ area.c2.x = x; }
                if(area.c1.y > area.c2.y){ area.c2.y = y; }
                else{ area.c1.y = y; }
                break;
            case 3:
                if(area.c1.x > area.c2.x){ area.c1.x = x; }
                else{ area.c2.x = x; }
                if(area.c1.y < area.c2.y){ area.c2.y = y; }
                else{ area.c1.y = y; }
                break;
            case 4:
                if(area.c1.x < area.c2.x){ area.c1.x = x; }
                else{ area.c2.x = x; }
                if(area.c1.y < area.c2.y){ area.c2.y = y; }
                else{ area.c1.y = y; }
                break;
            default:
                break;
        }
        //TODO : update only one area
        emit_areas_to_room();
    }


    // STROKES
    function handle_add_stroke(positions:any, old_pos:any, color:string, width:number, top_left:any, bot_right:any){
        g.add_stroke(positions, old_pos, color, width, top_left, bot_right);
        emit_strokes_to_room();
    }


    // COLORS
    function handle_update_colors(data) {
        for (const element of data) {
            if (element.type == "vertex") {
                if (g.vertices.has(element.index)) {
                    const vertex = g.vertices.get(element.index);
                    vertex.color = element.color;
                }
            }
            else if (element.type == "link") {
                if (g.links.has(element.index)) {
                    const link = g.links.get(element.index);
                    link.color = element.color;
                }
            }
        }
        emit_graph_to_room();
    }


    // LINKS
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

    function handle_add_link(vindex: number, windex: number, orientation: string) {
        let orient = ORIENTATION.UNDIRECTED;
        switch (orientation) {
            case "undirected":
                orient = ORIENTATION.UNDIRECTED
                break;
            case "directed":
                orient = ORIENTATION.DIRECTED
                break;
            case "digon":
                orient = ORIENTATION.DIGON
                break;
        }
        g.add_link(vindex, windex, orient);
        emit_graph_to_room();
    }



    // JSON
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


    // VERTICES 
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


    // OTHERS 
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
   
})




function get_other_clients_in_room(client_id:string, clientRooms):Map<string, User>{
    const users_in_room = new Map<string, User>();
    for (const id_client in clientRooms) {
        if(client_id != id_client && clientRooms[client_id] == clientRooms[id_client])
        {
            users_in_room.set(id_client, users.get(id_client));
        }
    }
    return users_in_room;
}










