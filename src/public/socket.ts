import { io } from "socket.io-client";
import { draw, draw_vertex } from "./draw";
import { Self, self_user, update_self_user_div, update_users_canvas_pos, update_user_list_div, User, users } from "./user";
import { ClientStroke } from "./board/stroke";
import { update_params_loaded } from "./parametors/parametor_manager";
import { ClientArea } from "./board/area";
import { update_options_graphs } from "./parametors/div_parametor";
import { init_list_parametors_for_area, make_list_areas } from "./board/area_div";
import { get_sensibilities, SENSIBILITY } from "./parametors/parametor";
import { local_board } from "./setup";
import { Board } from "./board/board";
import { ClientVertex } from "./board/vertex";
import { interactor_loaded } from "./interactors/interactor_manager";
import { display_weight_input, validate_weight } from "./interactors/text";
import { Coord, ORIENTATION, Vect } from "gramoloss";
import { ClientLink } from "./board/link";
export const socket = io()


export function setup_socket(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, board: Board) {
    const g = board.graph;
    
    // USERS
    socket.on('myId', handle_my_id);
    socket.on('room_id', handle_room_id);
    socket.on('update_room_id', handle_update_room_id);
    socket.on('update_user', update_user);
    socket.on('remove_user', remove_user);
    socket.on('clients', handle_clients);
    socket.on('update_other_self_user', update_other_self_user);
    socket.on('send_view', handle_send_view);
    socket.on('view_follower', handle_update_view_follower);

    function handle_room_id(romm_id:number){
        let url = new URL(document.URL);
        let urlsp = url.searchParams;
        let room_id = encodeURI(urlsp.get("room_id"));
        if (room_id === "null") {
            window.history.replaceState(null, null, "?room_id="+romm_id);
        }
    }

    function handle_update_room_id(new_romm_id:number){
            window.history.replaceState(null, null, "?room_id="+new_romm_id);
    }

    function handle_update_view_follower(x:number, y:number, zoom:number, id:string){
        // console.log("FOLLOWING USER:", x,y,zoom, id);
        if(users.has(id) && local_board.view.following == id){
            // console.log("Following......")
            local_board.view.camera = new Coord(x, y);
            local_board.view.zoom = zoom;
            g.update_canvas_pos(local_board.view);
            update_users_canvas_pos(local_board.view);
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        }
        else{
            // console.log("reset....");
            local_board.view.following = null;
        }
    }

    function handle_send_view(){
        // console.log("SENDING MY VIEW");
        socket.emit("my_view", local_board.view.camera.x, local_board.view.camera.y, local_board.view.zoom);
    }

    function update_other_self_user(id:string, label:string, color:string){
        // console.log(id, label, color);
        if (users.has(id)) {
            users.get(id).set_color(color);
            users.get(id).label = label;
        }
        else {
            users.set(id, new User(id, label, color, local_board.view));
        }
        update_user_list_div();
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }


    function handle_my_id(id: string, label:string, color:string) {
        let url = new URL(document.URL);
        let urlsp = url.searchParams;
        let room_id = encodeURI(urlsp.get("room_id"));
        if (room_id != "null") {
            console.log("room_id : ", room_id);
            socket.emit("change_room_to", room_id);
        }

        self_user.init(id, label, color);
        update_self_user_div();
    }

    function update_user(id: string, label: string, color: string, x: number, y: number) {
        if (users.has(id)) {
            users.get(id).set_pos(x,y,local_board.view);
        }
        else {
            users.set(id, new User(id, label, color, local_board.view,  new Coord(x, y)));
            update_user_list_div();
            // console.log("NEW USER !! ");
        }
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }


    function remove_user(userid: string) {
        if(local_board.view.following == userid){
            self_user.unfollow(userid);
        }
        users.delete(userid);
        update_user_list_div();
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }

    
    function handle_clients(users_entries){
        users.clear();
        for (const data of users_entries) {
            //TODO: Corriger ca: on est obligé de mettre de fausses coordonnées aux autres users à l'init car le serveur ne les stocke pas 
            const new_user = new User(data[0], data[1].label, data[1].color, local_board.view, new Coord(-100, -100));
            users.set(data[0], new_user);
        }
        // console.log(users);
        requestAnimationFrame(function () { update_user_list_div() });
    }




    // GRAPH 
    socket.on('graph', update_graph); // ALL
    socket.on('update_vertex_position', update_vertex_position); // V MOVE
    socket.on('update_vertex_positions', update_vertex_positions); // V MOVE
    socket.on('update_control_point', handle_update_control_point); // CP MOVE
    socket.on('update_control_points', handle_update_control_points); // CP MOVE
    socket.on('update_control_points2', handle_update_control_points2);
    socket.on('translate_vertices', handle_translate_vertices);
    socket.on('areas', handle_areas); // AREA
    socket.on('strokes', handle_strokes); // STROKES
    


    function handle_strokes(data){
        // console.log(data);
        g.strokes.clear();
        for(const s of data){
            const positions = new Array<Coord>();
            s[1].positions.forEach(e => {
                positions.push(new Coord(e.x, e.y));
            });
            const new_stroke = new ClientStroke(positions, s[1].color, s[1].width, local_board.view);
            g.strokes.set(s[0], new_stroke);
        }
        // update_params_loaded(g,false);
        requestAnimationFrame(function () { 
            draw(canvas, ctx, g) 
        });
        
    }



    function handle_areas(data){
        let old_area_ids = new Set<number>();
        for ( const index of g.areas.keys()){
            old_area_ids.add(index);
        }

        g.areas.clear();
        for(const s of data){
            const c1 = new Coord(s[1].c1.x, s[1].c1.y);
            const c2 = new Coord(s[1].c2.x, s[1].c2.y);
            const new_area = new ClientArea( s[1].label, c1, c2, s[1].color, local_board.view);
            g.areas.set(s[0], new_area);
            init_list_parametors_for_area(board, s[0], canvas, ctx);
        }

        let new_area_ids = new Set<number>();
        for ( const index of g.areas.keys()){
            new_area_ids.add(index);
        }

        for ( const index of old_area_ids){
            if (new_area_ids.has(index) == false){
                document.getElementById("area_"+ index).remove();
            }
        }
        
        update_params_loaded(g, new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC]), false);
        update_options_graphs(canvas, ctx, g);
        // make_list_areas(canvas, ctx, g);
        requestAnimationFrame(function () { 
            draw(canvas, ctx, g) 
        });
    }



    function handle_update_control_points(data) {
        for (const e of data) {
            if (g.links.has(e.index)) {
                const link = g.links.get(e.index);
                link.cp = new Coord(e.cp.x, e.cp.y);
                link.cp_canvas_pos = local_board.view.create_canvas_coord(link.cp);
                g.automatic_weight_position(e.index);
            }
        }
        update_params_loaded(g, new Set([SENSIBILITY.GEOMETRIC]), false);
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }

    function handle_update_control_points2(cp_entries){
        console.log("handle_update_control_points2: ", cp_entries);
        for (const data of cp_entries) {
            const link_index = data[0];
            const cp = data[1];
            if ( g.links.has(link_index)){
                const link = g.links.get(link_index);
               link.cp = new Coord(cp.x, cp.y);
                link.cp_canvas_pos = local_board.view.create_canvas_coord(link.cp);
                g.automatic_weight_position(link_index);
            }
        }
        update_params_loaded(g, new Set([SENSIBILITY.GEOMETRIC]), false);
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }

    function handle_translate_vertices(indices, shiftx: number, shifty: number){
        //console.log("Receive: update_translate_vertices");
        const shift = new Vect(shiftx, shifty);
        for( const index of indices){
            if ( g.vertices.has(index)){
                const vertex = g.vertices.get(index);
                const previous_pos = vertex.pos.copy();
                vertex.translate_by_server_vect(shift, local_board.view);
                const new_pos = vertex.pos.copy();

                for (const [link_index, link] of g.links.entries()) {
                    if ( link.start_vertex ==index){
                        const end_vertex_pos = g.vertices.get(link.end_vertex).pos;
                        link.transform_cp(new_pos, previous_pos, end_vertex_pos);
                        link.cp_canvas_pos = local_board.view.create_canvas_coord(link.cp);
                    } else if (link.end_vertex == index ){
                        const start_vertex_pos = g.vertices.get(link.start_vertex).pos;
                        link.transform_cp(new_pos, previous_pos, start_vertex_pos );
                        link.cp_canvas_pos = local_board.view.create_canvas_coord(link.cp);
                    }
                }
            }
            g.automatic_link_weight_position_from_vertex(index);
        }
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }

    function handle_update_control_point(index: number, c: Coord) {
        const link = g.links.get(index);
        link.cp = new Coord(c.x, c.y);
        link.cp_canvas_pos = local_board.view.create_canvas_coord(link.cp);
        g.automatic_weight_position(index);
        update_params_loaded(g, new Set([SENSIBILITY.GEOMETRIC]),false);
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }

    function update_graph(vertices_entries, links_entries, sensibilities) {
        console.log("I get a new graph");
        console.time('update_graph')

        // pour les vertices_entries c'est parce que on peut pas envoyer des Map par socket ...
        // edges = new_graph.edges marche pas car bizarrement ça ne copie pas les méthodes ...

        g.clear_vertices();
        for (const data of vertices_entries) {
            const new_vertex = new ClientVertex(data[1].pos.x, data[1].pos.y, data[1].weight, local_board.view);
            new_vertex.color = data[1].color;
            g.vertices.set(data[0], new_vertex);
        }

        g.clear_links();
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
            const cp = new Coord(data[1].cp.x, data[1].cp.y);
            const new_link = new ClientLink(data[1].start_vertex, data[1].end_vertex, cp, orient, data[1].color, data[1].weight, local_board.view);
            new_link.update_weight(data[1].weight, data[0]);
            g.links.set(data[0], new_link);
            g.automatic_weight_position(data[0]);            
        }

        /*
        // Console.log the graph in list of abstract links
        let s = "";
        for (const data of links_entries){
            s += "[" + data[1].start_vertex + ","  + data[1].end_vertex + "],"
        }
        console.log("[" + s + "]");
        */

        g.compute_vertices_index_string(local_board.view);

        init_list_parametors_for_area(board, -1, canvas, ctx);

        const sensi = get_sensibilities(sensibilities);
        update_params_loaded(g, sensi, false);
        console.timeEnd('update_graph')
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }





    function update_vertex_position(index: number, x: number, y: number) {
        //console.log("Receive: update_vertex_position");
        const v = g.vertices.get(index);
        v.pos.x = x;
        v.pos.y = y;
        // v.pos.update_canvas_pos_without_saving(local_board.view);
        v.canvas_pos = local_board.view.create_canvas_coord(v.pos);
        g.automatic_link_weight_position_from_vertex(index);
        update_params_loaded(g, new Set([SENSIBILITY.GEOMETRIC]), false);
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }



    function update_vertex_positions(data) {
        console.log("Receive: update_vertex_positions");
        for (const e of data) {
            const v = g.vertices.get(e.index);
            v.pos.x = e.x;
            v.pos.y = e.y;
            // v.pos.update_canvas_pos_without_saving(local_board.view);
            v.canvas_pos = local_board.view.create_canvas_coord(v.pos);
            g.automatic_link_weight_position_from_vertex(e.index);
        }
        update_params_loaded(g, new Set([SENSIBILITY.GEOMETRIC]), false);
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    }





}
