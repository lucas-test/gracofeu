import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import { self_user, update_users_canvas_pos, users } from '../user';
import { CanvasCoord, Coord, ServerCoord } from '../board/coord';
import { down_coord, has_moved, key_states, last_down, last_down_index } from './interactor_manager';
import { local_board } from '../setup';


// INTERACTOR SELECTION

export var interactor_selection = new Interactor("selection", "s", "selection.svg", new Set([DOWN_TYPE.VERTEX, DOWN_TYPE.LINK, DOWN_TYPE.CONTROL_POINT, DOWN_TYPE.STROKE]), 'default')

let previous_shift: ServerCoord = null;

interactor_selection.mousedown = (( canvas, ctx, g, e) => {
    if (last_down == DOWN_TYPE.VERTEX) {
        if (g.vertices.get(last_down_index).is_selected) {
            for (const index of g.vertices.keys()) {
                const vertex = g.vertices.get(index);
                vertex.save_pos();
            }
            for (var link of g.links.values()) {
                link.save_pos();
            }
        }
        else {
            g.vertices.get(last_down_index).save_pos();
            for (var link of g.links.values()) {
                if (link.start_vertex == last_down_index || link.end_vertex == last_down_index) {
                    link.save_pos();
                }
            }
        }
    } else if (last_down === DOWN_TYPE.LINK) {
        console.log("down link")
        // TODO : what to do ? 
    }
    else if(last_down === DOWN_TYPE.STROKE) {
        // console.log("down stroke");
    }
    else if (last_down === DOWN_TYPE.EMPTY) {

        if (key_states.get("Control")) {
            local_board.view.is_rectangular_selecting = true;
            local_board.view.selection_corner_1 = e; // peut etre faut copier
            local_board.view.selection_corner_2 = e; // peut etre faut copier
        }
        else {
            local_board.view.save_camera();
        }
    }
})

interactor_selection.mousemove = ((canvas, ctx, g, e) => {
    // console.log("mousemove");
    switch (last_down) {
        case DOWN_TYPE.VERTEX:
            const v = g.vertices.get(last_down_index)
            let indices = new Array();
            let mouse_canvas_coord: CanvasCoord;

            if (g.vertices.get(last_down_index).is_selected) {
                const selected_vertices = g.get_selected_vertices();
                indices = Array.from(selected_vertices);
                mouse_canvas_coord = g.align_position(v.pos.old_canvas_pos.add2(e.sub2(down_coord)), selected_vertices, canvas);   
            }
            else {
                mouse_canvas_coord = g.align_position(v.pos.old_canvas_pos.add2(e.sub2(down_coord)), new Set([last_down_index]), canvas);   
                indices.push(last_down_index);
            }

            const canvas_shift = mouse_canvas_coord.sub2(v.pos.old_canvas_pos);
            const shift = local_board.view.serverCoord2(canvas_shift);
            if (previous_shift == null){
                previous_shift = new ServerCoord(0,0);
            }
            //console.log("Send Request: translate_vertices", indices, shift.x-previous_shift.x, shift.y-previous_shift.y);
            socket.emit("translate_vertices", indices, shift.x-previous_shift.x, shift.y-previous_shift.y);
            previous_shift.copy_from(shift);
            return true;
            break;

        case DOWN_TYPE.EMPTY:
            if (local_board.view.is_rectangular_selecting) {
                local_board.view.selection_corner_2 = e; // peut etre faut copier
            } else {
                local_board.view.translate_camera_from_old(e.sub(down_coord));
                g.update_canvas_pos();
                update_users_canvas_pos();
 
                
                if(local_board.view.following !== null){
                    self_user.unfollow(local_board.view.following);
                }
                socket.emit("my_view", local_board.view.camera.x, local_board.view.camera.y, local_board.view.zoom);
            }
            return true;
            break;

        case DOWN_TYPE.CONTROL_POINT:
            var link = g.links.get(last_down_index);
            link.cp = local_board.view.serverCoord2(e);
            link.update_canvas_pos(local_board.view);
            socket.emit("update_control_point", last_down_index, link.cp)
            return true;
        case DOWN_TYPE.STROKE:
            const stroke = g.strokes.get(last_down_index);
            stroke.translate(e.sub2(down_coord), local_board.view);
            return true;
    }


    return false;
})

interactor_selection.mouseup = ((canvas, ctx, g, e) => {
    previous_shift = new ServerCoord(0,0);
    if (last_down === DOWN_TYPE.VERTEX) {
        if (has_moved === false) {
            if (g.vertices.get(last_down_index).is_selected) {
                if (key_states.get("Control")) { 
                    g.vertices.get(last_down_index).is_selected = false;
                }
            }
            else {
                if (key_states.get("Control")) {
                    g.vertices.get(last_down_index).is_selected = true;
                }
                else {
                    g.clear_all_selections();
                    g.vertices.get(last_down_index).is_selected = true;
                }
            }
        }
        else {
            const vertex_moved = g.vertices.get(last_down_index);
            for( const [index,v] of g.vertices.entries()){
                if( index != last_down_index && vertex_moved.is_nearby(v.pos.canvas_pos, 100)){
                    socket.emit("vertices_merge", index, last_down_index);
                    break;
                }
            }
        }

    } else if (last_down === DOWN_TYPE.LINK) {
        if (has_moved === false) {
            if (g.links.get(last_down_index).is_selected) {
                if (key_states.get("Control")) { 
                    g.links.get(last_down_index).is_selected = false;
                }
            }
            else {
                if (key_states.get("Control")) { 
                    g.links.get(last_down_index).is_selected = true;
                }
                else {
                    g.clear_all_selections();
                    g.links.get(last_down_index).is_selected = true;
                }
            }
        }

    }
    else if (last_down === DOWN_TYPE.STROKE)
    {
        if (has_moved === false) {
            if (g.strokes.get(last_down_index).is_selected) {
                if (key_states.get("Control")) { 
                    g.strokes.get(last_down_index).is_selected = false;
                }
            }
            else {
                if (key_states.get("Control")) { 
                    g.strokes.get(last_down_index).is_selected = true;
                }
                else {
                    g.clear_all_selections();
                    g.strokes.get(last_down_index).is_selected = true;
                }
            }
        } else {
            const stroke = g.strokes.get(last_down_index);
            const data_socket = new Array();
            data_socket.push({index: last_down_index, stroke_data: stroke});
            socket.emit("update_strokes", data_socket);
        }
    }
    else if (last_down === DOWN_TYPE.EMPTY) {
        if (local_board.view.is_rectangular_selecting) {
            local_board.view.is_rectangular_selecting = false;
            g.select_vertices_in_rect(local_board.view.selection_corner_1, local_board.view.selection_corner_2);
            g.select_links_in_rect(local_board.view.selection_corner_1, local_board.view.selection_corner_2);

        } else {
            local_board.view.save_camera();
            g.clear_all_selections();
        }

    }
})


