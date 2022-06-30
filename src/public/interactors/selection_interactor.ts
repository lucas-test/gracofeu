

import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import { view } from '../camera';
import { CanvasCoord, Coord } from '../local_graph';


// INTERACTOR SELECTION

export var interactor_selection = new Interactor("selection", "s", "selection.svg")
let down_coord: CanvasCoord; // à rajouter dans Interactor
let previous_camera: Coord;


interactor_selection.mousedown = ((down_type, down_element_index, canvas, ctx, g, e) => {
    if (down_type == DOWN_TYPE.VERTEX) {
        if (g.vertices.get(down_element_index).is_selected) {
            for (const index of g.vertices.keys()) {
                const vertex = g.vertices.get(index);
                vertex.save_pos();
            }
            for (var link of g.links.values()) {
                link.save_pos();
            }
        }
        else {
            g.vertices.get(down_element_index).save_pos();
            for (var link of g.links.values()) {
                if (link.start_vertex == down_element_index || link.end_vertex == down_element_index) {
                    link.save_pos();
                }
            }
        }
    } else if (down_type === DOWN_TYPE.LINK) {
        console.log("down link")
        // TODO : what to do ? 
    }
    else if (down_type === DOWN_TYPE.EMPTY) {

        // TODO
        if (false) { //(e.ctrlKey) {
            view.is_rectangular_selecting = true;
            view.selection_corner_1 = e; // peut etre faut copier
            view.selection_corner_2 = e; // peut etre faut copier
        }
        else {
            down_coord = e; // peut etre faut copier
            previous_camera = view.camera;
        }
    }
})

interactor_selection.mousemove = ((canvas, ctx, g, e) => {
    // console.log("mousemove");
    switch (interactor_selection.last_down) {
        case DOWN_TYPE.VERTEX:
            if (g.vertices.get(interactor_selection.last_down_index).is_selected) {
                const origin_vertex = g.vertices.get(interactor_selection.last_down_index);
                const data_socket = new Array();

                const mouse_canvas_coord = g.align_position(e, g.get_selected_vertices(), canvas);
                const mouse_server_coord = view.serverCoord2(mouse_canvas_coord);
                for (const index of g.vertices.keys()) {
                    const v = g.vertices.get(index);
                    if (v.is_selected) {
                        const nx = mouse_server_coord.x + v.old_pos.x - origin_vertex.old_pos.x;
                        const ny = mouse_server_coord.y + v.old_pos.y - origin_vertex.old_pos.y;
                        data_socket.push({ index: index, x: nx, y: ny });
                        // socket.emit("update_position", index, e.pageX - view.camera.x + v.old_pos.x - origin_vertex.old_pos.x, e.pageY - view.camera.y + v.old_pos.y - origin_vertex.old_pos.y);
                    }
                }

                const data_socket2 = new Array();
                for (const [index, link] of g.links.entries()) {
                    const v = g.vertices.get(link.start_vertex)
                    const w = g.vertices.get(link.end_vertex)
                    if (v.is_selected && w.is_selected) {
                        link.cp.x = link.old_cp.x + mouse_server_coord.x - origin_vertex.old_pos.x
                        link.cp.y = link.old_cp.y + mouse_server_coord.y - origin_vertex.old_pos.y
                        link.canvas_cp = view.canvasCoord(link.cp);
                        data_socket2.push({ index: index, cp: link.cp })
                    }
                    else if (v.is_selected && !w.is_selected) {
                        link.transform_control_point(v, w)
                        data_socket2.push({ index: index, cp: link.cp })
                    } else if (!v.is_selected && w.is_selected) {
                        link.transform_control_point(w, v)
                        data_socket2.push({ index: index, cp: link.cp })
                    }
                }
                socket.emit("update_control_points", data_socket2);
                socket.emit("update_positions", data_socket);
            }
            else {
                const v = g.vertices.get(interactor_selection.last_down_index)
                const mouse_canvas_coord = g.align_position(e, new Set([interactor_selection.last_down_index]), canvas);
                v.canvas_pos = mouse_canvas_coord;
                v.pos = view.serverCoord2(v.canvas_pos);

                const data_socket = new Array();
                for (let [index, link] of g.links.entries()) {
                    if (link.start_vertex == interactor_selection.last_down_index || link.end_vertex == interactor_selection.last_down_index) {
                        let w = g.vertices.get(link.start_vertex)
                        if (link.start_vertex == interactor_selection.last_down_index) {
                            w = g.vertices.get(link.end_vertex)
                        }
                        link.transform_control_point(v, w)
                        data_socket.push({ index: index, cp: link.cp })
                    }
                }
                socket.emit("update_control_points", data_socket);
                socket.emit("update_position", interactor_selection.last_down_index, v.pos.x, v.pos.y);
            }
            return true;
            break;

        case DOWN_TYPE.EMPTY:
            if (view.is_rectangular_selecting) {
                view.selection_corner_2 = e; // peut etre faut copier
            } else {
                view.camera.x = previous_camera.x + e.x - down_coord.x;
                view.camera.y = previous_camera.y + e.y - down_coord.y;
                g.update_canvas_pos();
                down_coord = e; // peut etre faut copier
            }
            return true;
            break;

        case DOWN_TYPE.CONTROL_POINT:
            var link = g.links.get(interactor_selection.last_down_index);
            link.cp = view.serverCoord2(e);
            link.canvas_cp = view.canvasCoord(link.cp);
            socket.emit("update_control_point", interactor_selection.last_down_index, link.cp)
            return true;
            break;
    }


    return false;
})

interactor_selection.mouseup = ((canvas, ctx, g, e) => {
    console.log("mouseup", interactor_selection.has_moved);
    if (interactor_selection.last_down === DOWN_TYPE.VERTEX) {
        if (interactor_selection.has_moved === false) {
            if (g.vertices.get(interactor_selection.last_down_index).is_selected) {
                if (false) { //e.ctrlKey) {
                    g.vertices.get(interactor_selection.last_down_index).is_selected = false;
                }
            }
            else {
                if (false) { //(e.ctrlKey) {
                    g.vertices.get(interactor_selection.last_down_index).is_selected = true;
                }
                else {
                    g.clear_all_selections();
                    g.vertices.get(interactor_selection.last_down_index).is_selected = true;
                }
            }
        }

    } else if (interactor_selection.last_down === DOWN_TYPE.LINK) {
        if (interactor_selection.has_moved === false) {
            if (g.links.get(interactor_selection.last_down_index).is_selected) {
                if (false) { //(e.ctrlKey) {
                    g.links.get(interactor_selection.last_down_index).is_selected = false;
                }
            }
            else {
                if (false) { //(e.ctrlKey) {
                    g.links.get(interactor_selection.last_down_index).is_selected = true;
                }
                else {
                    g.clear_all_selections();
                    g.links.get(interactor_selection.last_down_index).is_selected = true;
                }
            }
        }

    }
    else if (interactor_selection.last_down === DOWN_TYPE.EMPTY) {
        if (view.is_rectangular_selecting) {
            view.is_rectangular_selecting = false;
            g.select_vertices_in_rect(view.selection_corner_1, view.selection_corner_2);
            g.select_links_in_rect(view.selection_corner_1, view.selection_corner_2);

        } else {
            previous_camera = null;
            down_coord = null;
            g.clear_all_selections();
        }

    }
})


