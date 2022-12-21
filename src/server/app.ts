import express, { text } from 'express';
import {Graph, SENSIBILITY, Vertex, Coord, Link, ORIENTATION, Stroke, Area, AreaMoveCorner, AreaMoveSide, DeleteElements, ELEMENT_TYPE, GraphPaste, VerticesMerge, middle, Vect, TextZone, Board, HistBoard, UpdateElement, AddElement, TranslateElements} from "gramoloss";
import ENV from './.env.json';
import { getRandomColor, User, users } from './user';
import { eq_indices, makeid } from './utils';

const port = ENV.port;
const app = express();
const server = require('http').createServer(app).listen(port);
const io = require('socket.io')(server)
app.use(express.static('dist/public'));
app.get('/', function (req, res) { res.sendFile('index.html') })
console.log('Server started at http://localhost:' + port);


// gestion des rooms

const room_boards = new Map<string, HistBoard<Vertex, Link, Stroke, Area, TextZone>>();
const room_graphs = new Map<string, Graph<Vertex,Link, Stroke, Area>>();
const clientRooms = {};



const the_room = "theroom";
const the_graph = new Graph();
the_graph.set_vertex(0,new Vertex(100,300,""));
the_graph.set_vertex(1, new Vertex(200,300,""));
the_graph.set_vertex(2, new Vertex(200,400,""));
the_graph.set_vertex(3, new Vertex(100,400,""));
the_graph.add_link(new Link(0,1,new Coord(200,200), ORIENTATION.UNDIRECTED, "black", ""));
room_graphs.set(the_room, the_graph);





io.sockets.on('connection', function (client) {

    // INIT NEW PLAYER
    console.log("connection from ", client.id);
    const user_data = new User(client.id, getRandomColor());
    users.set(client.id, user_data);
    client.emit('myId', user_data.id, user_data.label, user_data.color, Date.now());

    // ROOM CREATION

    let room_id = makeid(5);
    client.join(room_id);
    clientRooms[client.id] = room_id;
    client.emit('room_id', room_id); // useless ? TODO remove
    console.log("new room : ", room_id);
    let g = new Graph();
    g.set_vertex(0, new Vertex(200,100,""));
    room_graphs.set(room_id, g);
    emit_graph_to_room(new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC]));
    emit_strokes_to_room();
    emit_areas_to_room();
    emit_users_to_client();

    let board = new HistBoard();
    board.graph = g;
    room_boards.set(room_id, board);



    if (ENV.mode == "dev") {
        room_id = the_room;
        client.join(room_id);
        g = the_graph;
        clientRooms[client.id] = room_id;
        emit_graph_to_client(new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC]));
    }

    function emit_graph_to_client(s: Set<SENSIBILITY>) {
        client.emit('graph', [...g.vertices.entries()], [...g.links.entries()], [...s]);
    }

    function emit_reset_board(){
        client.emit("reset_board", [...board.text_zones.entries()]);
    }

    function broadcast(name: string, data: any, s: Set<SENSIBILITY>){
        io.sockets.in(room_id).emit(name, data , [...s]);
    }

    function emit_graph_to_room(s: Set<SENSIBILITY>) {
        io.sockets.in(room_id).emit('graph', [...g.vertices.entries()], [...g.links.entries()], [...s]);
    }

    function emit_strokes_to_room() {
        io.sockets.in(room_id).emit('strokes', [...g.strokes.entries()]);
    }

    function emit_areas_to_room() {
        io.sockets.in(room_id).emit('areas', [...g.areas.entries()])
    }

    function emit_users_to_client() {
        if (client.id in clientRooms) {
            const users_in_room = get_other_clients_in_room(client.id, clientRooms);
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

    function handle_update_self_user(label: string, color: string) {
        if (users.has(client.id)) {
            users.get(client.id).color = color;
            users.get(client.id).label = label;
            client.to(room_id).emit('update_other_self_user', client.id, label, color);
        }
        else {
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
            board = room_boards.get(room_id);
            board.graph = g;
            emit_graph_to_client(new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC]));
            emit_strokes_to_room();
            emit_areas_to_room();
            emit_users_to_client();
            emit_reset_board();
            console.log(clientRooms);
        }
        else {
            console.log("asked room does not exist");
            client.emit("update_room_id", room_id);
        }
    }

    function handle_disconnect() {
        if (users.has(client.id)) {
            users.delete(client.id);
        }
        io.sockets.in(room_id).emit('remove_user', client.id);
    }

    function update_user(x: number, y: number) {
        client.to(room_id).emit('update_user', client.id, user_data.label, user_data.color, x, y);
    }

    function add_follower(id: string) {
        console.log("ADDING FOLLOWER...");
        if (users.has(client.id) && users.has(id)) {
            users.get(id).followers.push(client.id);
            io.to(id).emit("send_view");

            console.log("ADDED!");
        }
    }

    function remove_follower(id: string) {
        console.log("REMOVING FOLLOWER...");
        if (users.has(client.id) && users.has(id)) {
            const index = users.get(id).followers.indexOf(client.id);
            if (index > -1) {
                users.get(id).followers.splice(index, 1);
                console.log("REMOVED!");
            }
        }
    }

    function send_view_to_followers(x: number, y: number, zoom: number) {
        // console.log("SEND VIEW TO FOLLOWERS:", x,y,zoom, client.id, users.get(client.id).followers);
        for (const user_id of users.get(client.id).followers) {
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
    // client.on('delete_selected_elements', handle_delete_selected_elements);
    client.on('paste_graph', handle_paste_graph);
    client.on('vertices_merge', handle_vertices_merge);
    // Area
    client.on('area_move_side', handle_move_side_area);
    client.on('area_move_corner', handle_move_corner_area);
    // TextZones
    client.on("delete_text_zone", handle_delete_text_zone); // TODO undoable
    // Meta
    client.on("update_element", handle_update_element);
    client.on("add_element", handle_add_element);
    client.on("translate_elements", handle_translate_elements);
    client.on("delete_elements", handle_delete_elements);
    // translate_elements // ne regarde pas écraser la dernière modif // TODO
    // delete_elements // TODO

    // Not Elementary Actions
    client.on('undo', handle_undo);
    client.on('redo', handle_redo);
    client.on('load_json', handle_load_json); // TODO undoable

    // No modification on the graph
    client.on('get_json', handle_get_json);

    // ------------------------
    //
    // ------------------------

 

    function handle_add_element(kind: string, data, callback: (created_index: number) => void){
        console.log("handle_add_element", kind, data);
        let new_index: number;
        let new_element;

        if ( kind == "Stroke"){
            new_index = board.get_next_available_index_strokes();
            const positions = [];
            data.points.forEach(e => {
                positions.push(new Coord(e[1].x, e[1].y));
            });
            new_element = new Stroke(positions, data.color, data.width);
        } else if (kind == "Area"){
            new_index = board.get_next_available_index_area();
            const c1 = new Coord(data.c1.x, data.c1.y);
            const c2 = new Coord(data.c2.x, data.c2.y);
            new_element = new Area(data.label + new_index, c1 , c2 , data.color);
        } 
        else if (kind == "TextZone"){
            new_index = board.get_next_available_index_text_zone();
            const pos = new Coord(data.pos.x, data.pos.y);
            new_element = new TextZone(pos, 200, "new text zone");
        }else if (kind == "Vertex"){
            new_index = board.graph.get_next_available_index_vertex();
            const pos = new Coord(data.pos.x, data.pos.y);
            new_element = new Vertex(pos.x, pos.y, "");
        } else if (kind == "Link"){
            new_index = board.graph.get_next_available_index_links();
            let orient = ORIENTATION.UNDIRECTED;
            switch (data.orientation) {
                case "undirected":
                    orient = ORIENTATION.UNDIRECTED
                    break;
                case "directed":
                    orient = ORIENTATION.DIRECTED
                    break;
            }
            const start_vertex = board.graph.vertices.get(data.start_index);
            const end_vertex = board.graph.vertices.get(data.end_index);
            new_element = new Link(data.start_index, data.end_index, middle(start_vertex.pos, end_vertex.pos) , orient, "black", "");
        }else {
            console.log("kind is not supported: ", kind);
            return
        }

        const modif = new AddElement(kind, new_index, new_element);
        const r = board.try_push_new_modification(modif);
        if (typeof r === "string"){
            console.log(r);
        }else {
            callback(new_index);
            broadcast("add_element", {kind: kind, index: new_index, element: new_element}, new Set());
        }
    }


    function handle_translate_elements(indices: Array<[string ,number]>, raw_shift){
        // console.log("handle_translate_elements", indices);
        let shift = new Vect(raw_shift.x, raw_shift.y);
        console.log(shift);

        if ( board.modifications_stack.length > 0 ){
            const last_modif = board.modifications_stack[board.modifications_stack.length-1];
            if (last_modif.constructor  == TranslateElements ){
                const last_modif2 = last_modif as TranslateElements<Vertex,Link,Stroke,Area,TextZone>;
                if (eq_indices(last_modif2.indices, indices )){
                    shift.translate(last_modif2.shift);
                    last_modif2.deimplement(board);
                    board.modifications_stack.pop();
                }
            }
        }
        const modif = new TranslateElements(indices, shift);

        const r = board.try_push_new_modification(modif);
        if (typeof r === "string"){
            console.log(r);
        }else {
            broadcast("translate_elements", {indices: indices, shift: raw_shift}, new Set());
        }
    }

    function handle_delete_elements(indices: Array<[string ,number]>){
        console.log("handle_delete_elements", indices);
        const modif = DeleteElements.from_indices(board, indices);
        if (typeof modif === "string"){
            console.log(modif);
        } else {
            const r = board.try_push_new_modification(modif);
            if (typeof r === "string"){
                console.log(r);
            }else {
                broadcast("delete_elements", indices, new Set());
            }
        }
    }

   

    function handle_update_element(kind: string, index: number, param: string, new_value){
        console.log("handle_update_element", kind, index, param, new_value);
        const old_value = board.get_value(kind, index, param);
        const modif = new UpdateElement(index, kind, param, new_value, old_value )
        const r = board.try_push_new_modification(modif);
        if (typeof r === "string"){
            console.log(r);
        }else {
            broadcast("update_element",  {index: modif.index, kind: modif.kind, param: modif.param, value: modif.new_value}, new Set());
        }
    }

    function handle_delete_text_zone(index: number){
        console.log("handle_delete_text_zone", index);
        if (board.text_zones.has(index)){
            board.text_zones.delete(index);
            broadcast("delete_text_zone", index, new Set());
        }
    }

    function handle_undo() {
        console.log("Receive Request: undo");
        const r = board.cancel_last_modification();
        if (typeof r === "string"){
            console.log(r);
        }else {
            switch(r.constructor){
                case TranslateElements: {
                    const modif = r as TranslateElements<Vertex, Link, Stroke, Area, TextZone>;
                    broadcast("translate_elements",  {indices: modif.indices, shift: modif.shift.opposite()}, new Set());
                    break;
                }
                case UpdateElement: {
                    const modif = r as UpdateElement<Vertex, Link, Stroke, Area, TextZone>;
                    broadcast("update_element",  {index: modif.index, kind: modif.kind, param: modif.param, value: modif.old_value}, new Set());
                    break;
                }
                case AddElement: {
                    const modif = r as AddElement<Vertex, Link, Stroke, Area, TextZone>;
                    broadcast("delete_element",  {kind: modif.kind, index: modif.index}, new Set());
                    break;
                }
                case GraphPaste: {
                    emit_graph_to_room(new Set([SENSIBILITY.ELEMENT]));
                }
                case DeleteElements: {
                    emit_graph_to_room(new Set([SENSIBILITY.ELEMENT]));
                }
            }
        }

        // TODO to put in board
        // const sensibilities = g.reverse_last_modification();
        // emit_graph_to_room(sensibilities);
        // emit_strokes_to_room();
        // emit_areas_to_room();
    }

    function handle_redo() {
        console.log("Receive Request: redo");

        const r = board.redo();
        if (typeof r === "string"){
            console.log(r);
        }else {
            switch(r.constructor){
                case TranslateElements: {
                    const modif = r as TranslateElements<Vertex, Link, Stroke, Area, TextZone>;
                    broadcast("translate_elements",  {indices: modif.indices, shift: modif.shift}, new Set());
                    break;
                }
                case UpdateElement: {
                    const modif = r as UpdateElement<Vertex, Link, Stroke, Area, TextZone>;
                    broadcast("update_element",  {index: modif.index, kind: modif.kind, param: modif.param, value: modif.new_value}, new Set());
                    break;
                }
                case AddElement: {
                    const modif = r as AddElement<Vertex, Link, Stroke, Area, TextZone>;
                    broadcast("add_element",  {kind: modif.kind, index: modif.index, element: modif.element}, new Set());
                    break;
                }
                case GraphPaste: {
                    emit_graph_to_room(new Set([SENSIBILITY.ELEMENT])); // OPT
                }
                case DeleteElements: {
                    emit_graph_to_room(new Set([SENSIBILITY.ELEMENT])); // OPT
                }
            }
        }

        // TODO to put in board
        // const sensibilities = g.redo();
        // emit_graph_to_room(sensibilities);
        // emit_strokes_to_room();
        // emit_areas_to_room();
    }

    // AREAS 
    function handle_move_side_area(index: number, x: number, y: number, side_number: number) {
        console.log("Receive Request: move_side_area");
        if (g.areas.has(index)) {
            const area = g.areas.get(index);
            const new_modif = AreaMoveSide.from_area(index, area, x, y, side_number);
            g.try_implement_new_modification(new_modif);
            emit_areas_to_room(); // OPT: update only one area
        } else {
            console.log("Error: area index does not exist", index);
        }
    }



    function handle_move_corner_area(index: number, x: number, y: number, corner_number: number) {
        console.log("Receive Request: move_corner_area");
        if (g.areas.has(index)) {
            const area = g.areas.get(index);
            const new_modif = AreaMoveCorner.from_area(index, area, x, y, corner_number);
            g.try_implement_new_modification(new_modif);
            emit_areas_to_room(); // OPT: update only one area
        } else {
            console.log("Error: area index does not exist", index);
        }
    }

    


    // JSON
    function handle_load_json(s: string) {
        g.clear();

        const data = JSON.parse(s);
        for (const vdata of data.vertices) {
            const new_vertex = new Vertex(vdata[1]["pos"]["x"], vdata[1]["pos"]["y"], "");
            g.vertices.set(vdata[0], new_vertex)
        }
        for (const link of data.links) {
            // TODO
            //g.add_link_with_cp(link[1].start_vertex, link[1].end_vertex, link[1].orientation, new Coord(link[1].cp.x, link[1].cp.y))
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


  



    function handle_vertices_merge(vertex_index_fixed: number, vertex_index_to_remove: number) {
        console.log("Receive Request: vertices_merge");
        if (g.vertices.has(vertex_index_fixed) && g.vertices.has(vertex_index_to_remove)) {
            g.reverse_last_modification(); // TODO its not necessarily the last which is a translate
            const modif = g.create_vertices_merge_modif(vertex_index_fixed, vertex_index_to_remove);
            const sensi = g.try_implement_new_modification(modif);
            emit_graph_to_room(sensi);
        }
    }


    // OTHERS 
    function handle_paste_graph(vertices_entries, links_entries) {
        console.log("Receive Request: paste graph");

        const added_vertices = new Map<number, Vertex>();
        const added_links = new Map<number, Link>();
        const vertex_indices_transformation = new Map<number, number>();
        const new_vertex_indices: Array<number> = g.get_next_n_available_vertex_indices(vertices_entries.length);
        let i = 0;
        for (const data of vertices_entries) {
            const vertex = new Vertex(data[1].pos.x, data[1].pos.y, "");
            added_vertices.set(new_vertex_indices[i], vertex);
            vertex_indices_transformation.set(data[0], new_vertex_indices[i]);
            i++;
        }

        const new_link_indices = g.get_next_n_available_link_indices(links_entries.length);
        let j = 0;
        for (const data of links_entries) {
            let orient = ORIENTATION.UNDIRECTED;
            switch (data[1].orientation) {
                case "UNDIRECTED":
                    orient = ORIENTATION.UNDIRECTED
                    break;
                case "DIRECTED":
                    orient = ORIENTATION.DIRECTED
                    break;
            }
            const start_index = vertex_indices_transformation.get(data[1].start_vertex);
            const end_index = vertex_indices_transformation.get(data[1].end_vertex);
            const cp = new Coord(data[1].cp.x, data[1].cp.y);
            const link = new Link(start_index, end_index, cp, orient, data[1].color, data[1].weight);

            added_links.set(new_link_indices[j], link);
            j++;
        }

        const modif = new GraphPaste(added_vertices, added_links);
        const r = board.try_push_new_modification(modif);
        if (typeof r === "string"){
            console.log(r);
        }else {
            // for (const [index, vertex] of modif.added_vertices.entries()){
            //     broadcast("add_element", {kind: "Vertex", index: index, element: vertex}, new Set());
            // }
            emit_graph_to_room(new Set([SENSIBILITY.ELEMENT]));
        }
    }

    // function handle_delete_selected_elements(data) {
    //     const deleted_vertices = new Map();
    //     const deleted_links = new Map();
    //     const deleted_strokes = new Map();
    //     const deleted_areas = new Map();

    //     for (const e of data) {
    //         if (e.type == "vertex") {
    //             if (g.vertices.has(e.index)) {
    //                 const vertex = g.vertices.get(e.index);
    //                 deleted_vertices.set(e.index, vertex);
    //                 g.links.forEach((link, link_index) => {
    //                     if (link.end_vertex === e.index || link.start_vertex === e.index) {
    //                         deleted_links.set(link_index, link);
    //                     }
    //                 })
    //             }
    //         }
    //         else if (e.type == "link") {
    //             if (g.links.has(e.index)) {
    //                 const link = g.links.get(e.index);
    //                 deleted_links.set(e.index, link);
    //             }
    //         }
    //         else if (e.type == "stroke") {
    //             if (g.strokes.has(e.index)) {
    //                 const stroke = g.strokes.get(e.index);
    //                 deleted_strokes.set(e.index, stroke);
    //             }
    //         }
    //         else if (e.type == "area") {
    //             if (g.areas.has(e.index)) {
    //                 const area = g.areas.get(e.index);
    //                 deleted_areas.set(e.index, area);
    //             }
    //         }
    //     }

    //     const modif = new DeleteElements(deleted_vertices, deleted_links, deleted_strokes, deleted_areas);
    //     const triggered_sensibilities = g.try_implement_new_modification(modif);

    //     if (deleted_vertices.size > 0 || deleted_links.size > 0) {
    //         emit_graph_to_room(triggered_sensibilities);
    //     }

    //     if (deleted_strokes.size > 0) {
    //         emit_strokes_to_room();
    //     }

    //     if (deleted_areas.size > 0) {
    //         emit_areas_to_room();
    //     }
    // }
})




function get_other_clients_in_room(client_id: string, clientRooms): Map<string, User> {
    const users_in_room = new Map<string, User>();
    for (const id_client in clientRooms) {
        if (client_id != id_client && clientRooms[client_id] == clientRooms[id_client] && users.has(id_client)) {
            users_in_room.set(id_client, users.get(id_client));
        }
    }
    return users_in_room;
}










