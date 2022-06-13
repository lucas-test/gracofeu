

import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import { camera, view } from '../camera';
import { Coord } from '../local_graph';

// INTERACTOR SELECTION

export var interactor_selection = new Interactor("selection", "s", "selection.svg")
let down_coord: Coord;
let previous_camera: Coord;


interactor_selection.mousedown = ((down_type, down_element_index, canvas, ctx, g, e) => {
    if (down_type == DOWN_TYPE.VERTEX) {
        if (g.vertices.get(down_element_index).is_selected) {
            for (const index of g.vertices.keys()) {
                const vertex = g.vertices.get(index);
                vertex.old_pos = vertex.pos;
                // socket.emit("save_pos", index);
            }
        }
        else {
            g.vertices.get(down_element_index).old_pos = g.vertices.get(down_element_index).pos;
            // socket.emit("save_pos", down_element_index);
        }
    } else if (down_type === DOWN_TYPE.EMPTY) {
        down_coord = new Coord(e.pageX, e.pageY);
        previous_camera = camera;
    }
})

interactor_selection.mousemove = ((canvas, ctx, g, e) => {
    // console.log("mousemove");
    if (interactor_selection.last_down == DOWN_TYPE.VERTEX) {
        if (g.vertices.get(interactor_selection.last_down_index).is_selected) {
            const origin_vertex = g.vertices.get(interactor_selection.last_down_index);
            const data_socket = new Array();

            for (const index of g.vertices.keys()) {
                const v = g.vertices.get(index);
                if (v.is_selected) {
                    data_socket.push({ index: index, x: e.pageX - camera.x + v.old_pos.x - origin_vertex.old_pos.x, y: e.pageY - camera.y + v.old_pos.y - origin_vertex.old_pos.y });
                    // socket.emit("update_position", index, e.pageX - camera.x + v.old_pos.x - origin_vertex.old_pos.x, e.pageY - camera.y + v.old_pos.y - origin_vertex.old_pos.y);
                }
            }
            socket.emit("update_positions", data_socket);
        }
        else {
            socket.emit("update_position", interactor_selection.last_down_index, e.pageX - camera.x, e.pageY - camera.y);
        }
        return true;
    } else if (interactor_selection.last_down === DOWN_TYPE.EMPTY) {
        camera.x = previous_camera.x + e.pageX - down_coord.x;
        camera.y = previous_camera.y + e.pageY - down_coord.y;
        down_coord = new Coord(e.pageX, e.pageY);
        return true;
    }
    return false;
})

interactor_selection.mouseup = ((canvas, ctx, g, e) => {
    console.log("mouseup", interactor_selection.has_moved);
    if (interactor_selection.last_down === DOWN_TYPE.VERTEX) {
        if (interactor_selection.has_moved === false) {
            // socket.emit('select_vertex', interactor_selection.last_down_index);
            if (g.vertices.get(interactor_selection.last_down_index).is_selected) {
                if (e.ctrlKey) {
                    g.vertices.get(interactor_selection.last_down_index).is_selected = false;
                }
            }
            else {
                if (e.ctrlKey) {
                    g.vertices.get(interactor_selection.last_down_index).is_selected = true;
                }
                else {
                    g.deselect_all_vertices();
                    g.vertices.get(interactor_selection.last_down_index).is_selected = true;
                }
            }
        }
    } else if (interactor_selection.last_down === DOWN_TYPE.EMPTY) {
        previous_camera = null;
        down_coord = null;

        g.deselect_all_vertices();
    }
})


