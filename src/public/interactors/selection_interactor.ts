import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import { self_user, update_users_canvas_pos, users } from '../user';
import { down_coord, has_moved, key_states, last_down, last_down_index } from './interactor_manager';
import { local_board } from '../setup';
import { CanvasVect } from '../board/vect';
import { CanvasCoord } from '../board/vertex';
import { ClientGraph } from '../board/graph';
import { Coord, Vect } from 'gramoloss';


// INTERACTOR SELECTION

export var interactor_selection = new Interactor("selection", "s", "selection.svg", new Set([DOWN_TYPE.VERTEX, DOWN_TYPE.LINK, DOWN_TYPE.CONTROL_POINT, DOWN_TYPE.STROKE]), 'default')

let previous_shift: Vect = new Vect(0,0);
let previous_canvas_shift = new CanvasVect(0,0);
let vertex_center_shift = new CanvasVect(0,0);

interactor_selection.mousedown = (( canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    previous_shift = new Vect(0,0);
    previous_canvas_shift = new CanvasVect(0,0);
    if (last_down === DOWN_TYPE.EMPTY) {
        if (key_states.get("Control")) {
            local_board.view.is_rectangular_selecting = true;
            local_board.view.selection_corner_1 = e; // peut etre faut copier
            local_board.view.selection_corner_2 = e; // peut etre faut copier
        }
    }else if (last_down == DOWN_TYPE.VERTEX){
        if (g.vertices.has(last_down_index)){
            const v = g.vertices.get(last_down_index);
            vertex_center_shift = CanvasVect.from_canvas_coords(e, v.canvas_pos);
        }
    }
})

interactor_selection.mousemove = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    switch (last_down) {
        case DOWN_TYPE.VERTEX:
            const v = g.vertices.get(last_down_index)
            let indices = new Array();
            
            if (g.vertices.get(last_down_index).is_selected) {
                const selected_vertices = g.get_selected_vertices();
                indices = Array.from(selected_vertices);
                e.translate_by_canvas_vect(vertex_center_shift);
                e = g.align_position(e, selected_vertices, canvas, local_board.view);
                e.translate_by_canvas_vect(vertex_center_shift.opposite());
            }
            else {
                e.translate_by_canvas_vect(vertex_center_shift);
                e = g.align_position(e, new Set([last_down_index]), canvas, local_board.view);
                e.translate_by_canvas_vect(vertex_center_shift.opposite());
                indices.push(last_down_index);
            }
            
            const shift = local_board.view.server_vect(CanvasVect.from_canvas_coords(down_coord,e));
            socket.emit("translate_vertices", indices, shift.x-previous_shift.x, shift.y-previous_shift.y);
            previous_shift.set_from(shift);
            return true;
            break;

        case DOWN_TYPE.EMPTY:
            if (local_board.view.is_rectangular_selecting) {
                local_board.view.selection_corner_2 = e; // peut etre faut copier
            } else {
                const shift = CanvasVect.from_canvas_coords(down_coord,e);
                local_board.view.translate_camera(shift.sub(previous_canvas_shift));
                previous_canvas_shift.set_from(shift);
                local_board.update_after_camera_change();
                g.update_canvas_pos(local_board.view);
                update_users_canvas_pos(local_board.view);
 
                
                if(local_board.view.following !== null){
                    self_user.unfollow(local_board.view.following);
                }
                socket.emit("my_view", local_board.view.camera.x, local_board.view.camera.y, local_board.view.zoom);
            }
            return true;
            break;

        case DOWN_TYPE.CONTROL_POINT:{
            if ( g.links.has(last_down_index)){
                let indices = [last_down_index];
                const shift = local_board.view.server_vect(CanvasVect.from_canvas_coords(down_coord,e));
                socket.emit("translate_control_points", indices, shift.x-previous_shift.x, shift.y-previous_shift.y);
                previous_shift.set_from(shift);
                return true;
            }
            return false;
        }
        case DOWN_TYPE.STROKE:{
            if ( g.strokes.has(last_down_index)){
                const stroke = g.strokes.get(last_down_index);
                const shift = CanvasVect.from_canvas_coords(down_coord,e);
                stroke.translate_by_canvas_vect(shift.sub(previous_canvas_shift), local_board.view);
                previous_canvas_shift.set_from(shift);
                return true;
            }
        }
    }


    return false;
})

interactor_selection.mouseup = ((canvas, ctx, g, e) => {
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
                if( index != last_down_index && vertex_moved.is_nearby(v.canvas_pos, 100)){
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
            const canvas_shift = CanvasVect.from_canvas_coords(down_coord, e);
            const shift = local_board.view.server_vect(canvas_shift);
            socket.emit("translate_strokes", [last_down_index], shift.x, shift.y);
        }
    }
    else if (last_down === DOWN_TYPE.EMPTY) {
        if (local_board.view.is_rectangular_selecting) {
            local_board.view.is_rectangular_selecting = false;
            g.select_vertices_in_rect(local_board.view.selection_corner_1, local_board.view.selection_corner_2);
            g.select_links_in_rect(local_board.view.selection_corner_1, local_board.view.selection_corner_2);

        } else {
            g.clear_all_selections();
        }

    }
})


