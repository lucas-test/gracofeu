import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import { self_user, update_users_canvas_pos, users } from '../user';
import { CanvasCoord, Coord } from '../board/coord';
import { down_coord, has_moved, last_down, last_down_index } from './interactor_manager';
import { local_board } from '../setup';


// INTERACTOR SELECTION

export var interactor_selection = new Interactor("selection", "s", "selection.svg", new Set([DOWN_TYPE.VERTEX, DOWN_TYPE.LINK, DOWN_TYPE.CONTROL_POINT, DOWN_TYPE.STROKE]), 'default')


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

        // TODO
        if (false) { //(e.ctrlKey) {
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
            if (g.vertices.get(last_down_index).is_selected) {
                const origin_vertex = g.vertices.get(last_down_index);
                const data_socket = new Array();
                const mouse_canvas_coord = g.align_position(origin_vertex.pos.old_canvas_pos.add2(e.sub2(down_coord)), g.get_selected_vertices(), canvas);
                const shift = mouse_canvas_coord.sub2(origin_vertex.pos.old_canvas_pos);

                for (const index of g.vertices.keys()) {
                    const v = g.vertices.get(index);
                    if (v.is_selected) {
                        v.translate(shift, local_board.view);
                        data_socket.push({ index: index, x: v.pos.x, y: v.pos.y });
                    }
                }

                const data_socket2 = new Array();
                for (const [index, link] of g.links.entries()) {
                    const v = g.vertices.get(link.start_vertex)
                    const w = g.vertices.get(link.end_vertex)
                    if (v.is_selected && w.is_selected) {
                        link.translate_cp(shift, local_board.view);
                        data_socket2.push({ index: index, cp: link.cp })
                    }
                    else if (v.is_selected && !w.is_selected) {
                        link.transform_control_point(v, w, local_board.view)
                        data_socket2.push({ index: index, cp: link.cp })
                    } else if (!v.is_selected && w.is_selected) {
                        link.transform_control_point(w, v, local_board.view)
                        data_socket2.push({ index: index, cp: link.cp })
                    }
                }
                socket.emit("update_control_points", data_socket2);
                socket.emit("update_positions", data_socket);
            }
            else {
                const v = g.vertices.get(last_down_index)
                const mouse_canvas_coord = g.align_position(v.pos.old_canvas_pos.add2(e.sub2(down_coord)), new Set([last_down_index]), canvas);   
                v.translate(mouse_canvas_coord.sub2(v.pos.old_canvas_pos), local_board.view);
                //v.pos.canvas_pos = mouse_canvas_coord;
                //v.pos.update_from_canvas_pos(local_board.view);

                const data_socket = new Array();
                for (let [index, link] of g.links.entries()) {
                    if (link.start_vertex == last_down_index || link.end_vertex == last_down_index) {
                        let w = g.vertices.get(link.start_vertex)
                        if (link.start_vertex == last_down_index) {
                            w = g.vertices.get(link.end_vertex)
                        }
                        link.transform_control_point(v, w, local_board.view)
                        data_socket.push({ index: index, cp: link.cp })
                    }
                }
                socket.emit("update_control_points", data_socket);
                socket.emit("update_position", last_down_index, v.pos.x, v.pos.y);
            }
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
    
    if (last_down === DOWN_TYPE.VERTEX) {
        if (has_moved === false) {
            if (g.vertices.get(last_down_index).is_selected) {
                if (false) { //e.ctrlKey) {
                    g.vertices.get(last_down_index).is_selected = false;
                }
            }
            else {
                if (false) { //(e.ctrlKey) {
                    g.vertices.get(last_down_index).is_selected = true;
                }
                else {
                    g.clear_all_selections();
                    g.vertices.get(last_down_index).is_selected = true;
                }
            }
        }

    } else if (last_down === DOWN_TYPE.LINK) {
        if (has_moved === false) {
            if (g.links.get(last_down_index).is_selected) {
                if (false) { //(e.ctrlKey) {
                    g.links.get(last_down_index).is_selected = false;
                }
            }
            else {
                if (false) { //(e.ctrlKey) {
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
                if (false) { //e.ctrlKey) {
                    g.strokes.get(last_down_index).is_selected = false;
                }
            }
            else {
                if (false) { //(e.ctrlKey) {
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


