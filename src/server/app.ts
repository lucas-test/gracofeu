import express from 'express';
import { Graph, SENSIBILITY } from './graph';
import ENV from './.env.json';
import { Vertex } from './vertex';
import { getRandomColor, User, users } from './user';
import { Coord } from './coord';
import { ORIENTATION } from './link';
import { AddLink, AddStroke, AddVertex, ColorModification, DeleteElements, TranslateControlPoints, TranslateStrokes, TranslateVertices, UpdateColors, UpdateLinkWeight, UpdateSeveralVertexPos } from './modifications';
import { Stroke } from './stroke';

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
    emit_graph_to_room(new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC]));
    emit_strokes_to_room();
    emit_areas_to_room();
    emit_users_to_client();

    if (ENV.mode == "dev") {
        room_id = the_room;
        client.join(room_id);
        g = the_graph;
        clientRooms[client.id] = room_id;
        emit_graph_to_client(new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC]));
    }

    function emit_graph_to_client(s:Set<SENSIBILITY>) {
        client.emit('graph', [...g.vertices.entries()], [...g.links.entries()], [... s]);
    }

    function emit_graph_to_room(s:Set<SENSIBILITY>) {
        io.sockets.in(room_id).emit('graph', [...g.vertices.entries()], [...g.links.entries()], [... s]);
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
            emit_graph_to_client(new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC]));
            emit_strokes_to_room();
            emit_areas_to_room();
            emit_users_to_client();
            console.log(clientRooms);
        }
        else {
            console.log("asked room does not exist");
            client.emit("update_room_id", room_id);
        }
    }

    function handle_disconnect() {
        if(users.has(client.id)){
            users.delete(client.id);
        }
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

    // A handle function starts by treating the data
    // forms a Modification
    // calls g.try_implement(modif)
    // send_the_graph 
    // TODO just send the modif

    // Elementary Actions
    client.on('add_vertex', (x: number, y: number, callback) => { callback(handle_add_vertex(x, y)) });
    client.on('add_link', handle_add_link);
    client.on('delete_selected_elements', handle_delete_selected_elements);
    client.on('paste_graph', handle_paste_graph); // TODO modif
    client.on('vertices_merge', handle_vertices_merge); // TODO modif

    // Vertices Positions
    client.on('translate_vertices', handle_translate_vertices);
    client.on('update_positions', handle_update_positions);  // TODO remove

    // Control Points
    client.on('translate_control_points', handle_translate_control_points);

    // Area
    client.on('add_area', handle_add_area); // TODO modif
    client.on('area_move_side', handle_move_side_area); // TODO modif
    client.on('area_move_corner', handle_move_corner_area); // TODO modif
    client.on('area_translate', handle_area_translate); // TODO modif

    // Stroke
    client.on('add_stroke', handle_add_stroke);
    client.on('translate_strokes', handle_translate_strokes);

    // Vertices & Links & Strokes attributes
    // TODO: merge them?
    client.on('update_colors', handle_update_colors);
    client.on('update_weight', handle_update_weight);

    // Not Elementary Actions
    client.on('undo', handle_undo);
    client.on('redo', handle_redo);
    client.on('load_json', handle_load_json); // TODO modif

    // No modification on the graph
    client.on('get_json', handle_get_json);

    // ------------------------
    //
    // ------------------------

    function handle_undo(){
        console.log("Receive Request: undo");
        const sensibilities = g.reverse_last_modification();
        emit_graph_to_room(sensibilities);
        emit_strokes_to_room();
    }

    function handle_redo(){
        console.log("Receive Request: redo");
        const sensibilities = g.redo();
        emit_graph_to_room(sensibilities);
        emit_strokes_to_room();
    }

    // AREAS 
    function handle_area_translate(index: number, corner_top_left: Coord, corner_bottom_right: Coord){
        if ( g.areas.has(index)){
            const area = g.areas.get(index);
            area.c1 = new Coord(corner_top_left.x, corner_top_left.y);
            area.c2 = new Coord(corner_bottom_right.x, corner_bottom_right.y);
            emit_areas_to_room();
        }
    }

    function handle_add_area(c1x:number, c1y:number, c2x:number, c2y:number, label:string, color:string, callback: (created_area_index: number) => void){
        const created_area_index = g.add_area(new Coord(c1x, c1y), new Coord(c2x, c2y), label, color);
        emit_areas_to_room();
        callback(created_area_index);
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
    function handle_add_stroke(points:any, color:string, width:number, top_left_data:any, bot_right_data:any){
        console.log("Receive request: add_stroke");
        const index = g.get_next_available_index_strokes();
        const positions = [];
        points.forEach(e => {
            positions.push(new Coord(e[1].x, e[1].y));
        });
        const top_left = new Coord(top_left_data.x, top_left_data.y);
        const bot_right = new Coord(bot_right_data.x, bot_right_data.y);
        const new_stroke = new Stroke(positions, color, width, top_left, bot_right);
        const modif = new AddStroke(index, new_stroke);
        g.try_implement_new_modification(modif)
        emit_strokes_to_room();
    }


    


    function handle_translate_strokes(raw_indices, shiftx: number, shifty: number) {
        console.log("handle_translate_strokes", raw_indices, shiftx, shifty);
        const shift = new Coord(shiftx, shifty);
        const indices = new Set<number>();
        for ( const index of raw_indices.values()){
            indices.add(index);
        }
        g.try_implement_new_modification(new TranslateStrokes(indices, shift));
        emit_strokes_to_room();
    }
   


    // COLORS
    function handle_update_colors(data) {
        let is_stroke_modifying = false;
        const modif_data = new Array();
        for (const element of data) {
            if (element.type == "vertex") {
                if (g.vertices.has(element.index)) {
                    const vertex = g.vertices.get(element.index);
                    modif_data.push(new ColorModification(element.type, element.index, element.color, vertex.color));
                }
            }
            else if (element.type == "link") {
                if (g.links.has(element.index)) {
                    const link = g.links.get(element.index);
                    modif_data.push(new ColorModification(element.type, element.index, element.color, link.color));
                }
            }
            else if (element.type == "stroke"){
                if(g.strokes.has(element.index)){
                    is_stroke_modifying = true;
                    const stroke = g.strokes.get(element.index);
                    modif_data.push(new ColorModification(element.type, element.index, element.color, stroke.color));
                }
            }
        }
        g.try_implement_new_modification(new UpdateColors(modif_data));
        emit_graph_to_room(new Set([SENSIBILITY.COLOR]));
        if (is_stroke_modifying){
            emit_strokes_to_room()
        }
    }


    // LINKS
    function handle_translate_control_points(raw_indices, shiftx: number, shifty: number){
        console.log("handle_translate_control_points", raw_indices, shiftx, shifty);
        const shift = new Coord(shiftx, shifty);
        const indices = new Set<number>();
        for ( const index of raw_indices.values()){
            indices.add(index);
        }
        g.try_implement_new_modification(new TranslateControlPoints(indices, shift));
        emit_graph_to_room(new Set());
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

        const link_index = g.get_next_available_index_links();
        const sensi = g.try_implement_new_modification( new AddLink(link_index,vindex, windex, orient) );
        emit_graph_to_room(sensi);
        //param_weighted_distance_identification(g);
    }

    function handle_update_weight(link_index: number, new_weight: string){
        if (g.links.has(link_index)){
            const previous_weight = g.links.get(link_index).weight;
            g.try_implement_new_modification(new UpdateLinkWeight(link_index, new_weight, previous_weight));
            emit_graph_to_room(new Set([SENSIBILITY.WEIGHT]));
        }
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
        emit_graph_to_room(new Set([SENSIBILITY.COLOR, SENSIBILITY.ELEMENT, SENSIBILITY.GEOMETRIC]));
    }

    function handle_get_json(callback) {
        const graph_stringifiable = {
            vertices: Array.from(g.vertices.entries()),
            links: Array.from(g.links.entries()),
        }
        callback(JSON.stringify(graph_stringifiable));
    }


    // VERTICES 
    function handle_update_positions(data) {
        const previous_positions = new Map();
        for (const e of data) {
            let vertex = g.vertices.get(e.index);
            previous_positions.set(e.index, vertex.pos.copy()); 
            vertex.pos.x = e.x;
            vertex.pos.y = e.y;
        }
        g.add_modification(new UpdateSeveralVertexPos(previous_positions));
        io.sockets.in(room_id).emit('update_vertex_positions', data);
    }

    function handle_translate_vertices(raw_indices, shiftx: number, shifty: number){
        //console.log("handle_translate_vertices")
        //console.log(raw_indices);
        const shift = new Coord(shiftx, shifty);
        const indices = new Set<number>();
        for ( const index of raw_indices.values()){
            indices.add(index);
        }
        g.try_implement_new_modification(new TranslateVertices(indices, shift));
        io.sockets.in(room_id).emit('translate_vertices', raw_indices, shiftx, shifty);
    }


    function handle_add_vertex(x: number, y: number) {
        let index = g.get_next_available_index();
        const sensi = g.try_implement_new_modification( new AddVertex(index,x,y) );
        emit_graph_to_room(sensi);
        return index;
    }

    function handle_vertices_merge(vertex_index_fixed: number, vertex_index_to_remove: number){
        g.vertices_merge(vertex_index_fixed, vertex_index_to_remove);
        emit_graph_to_room(new Set([SENSIBILITY.ELEMENT]));
    }


    // OTHERS 
    function handle_paste_graph(vertices_entries, links_entries){

        const new_indices = new Map<number, number>();
        for (const data of vertices_entries) {
            let index = g.add_vertex(data[1].pos.x, data[1].pos.y);
            new_indices.set(data[0], index);
        }
        
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
            g.add_link(new_indices.get(data[1].start_vertex), new_indices.get(data[1].end_vertex), orient);
        }

        emit_graph_to_room(new Set([SENSIBILITY.ELEMENT]))
    }

    function handle_delete_selected_elements(data) {
        const deleted_vertices = new Map();
        const deleted_links = new Map();
        const deleted_strokes = new Map();
        const deleted_areas = new Map();

        for (const e of data) {
            if (e.type == "vertex") {
                if (g.vertices.has(e.index)){
                    const vertex = g.vertices.get(e.index);
                    deleted_vertices.set(e.index, vertex);
                    g.links.forEach((link, link_index) => {
                        if (link.end_vertex === e.index || link.start_vertex === e.index) {
                            deleted_links.set(link_index, link);
                        }
                    })
                }
            }
            else if (e.type == "link") {
                if (g.links.has(e.index)){
                    const link = g.links.get(e.index);
                    deleted_links.set(e.index, link);
                }
            }
            else if (e.type == "stroke") {
                if (g.strokes.has(e.index)){
                    const stroke = g.strokes.get(e.index);
                    deleted_strokes.set(e.index, stroke);
                }
            }
            else if (e.type == "area") {
                if (g.areas.has(e.index)){
                    const area = g.areas.get(e.index);
                    deleted_areas.set(e.index, area);
                }
            }
        }

        const modif = new DeleteElements(deleted_vertices, deleted_links, deleted_strokes, deleted_areas);
        const triggered_sensibilities = g.try_implement_new_modification(modif);

        if(deleted_vertices.size > 0 || deleted_links.size > 0){
            emit_graph_to_room(triggered_sensibilities); 
        }
        
        if(deleted_strokes.size > 0){
            emit_strokes_to_room();
        }

        if(deleted_areas.size > 0){
            emit_areas_to_room();
        }
    }
})




function get_other_clients_in_room(client_id:string, clientRooms):Map<string, User>{
    const users_in_room = new Map<string, User>();
    for (const id_client in clientRooms) {
        if(client_id != id_client && clientRooms[client_id] == clientRooms[id_client] && users.has(id_client))
        {
            users_in_room.set(id_client, users.get(id_client));
        }
    }
    return users_in_room;
}










