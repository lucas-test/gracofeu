
import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import {  ORIENTATION } from '../board/link';
import { CanvasCoord } from '../board/coord';
import { last_down, last_down_index } from './interactor_manager';
import { local_board } from '../setup';


// INTERACTOR EDGE

var index_last_created_vertex = null; // est ce qu'on peut pas intégrer ça dans interactor_edge directement ?


export var interactor_edge = new Interactor("edge", "e", "edition.svg", new Set([DOWN_TYPE.VERTEX]));

interactor_edge.mousedown = (( canvas, ctx, g, e) => {
    if (last_down == DOWN_TYPE.EMPTY) {
        local_board.view.is_link_creating = true;
        const pos = g.align_position(e, new Set(), canvas);

        local_board.view.link_creating_start = pos;
        local_board.view.link_creating_type = ORIENTATION.UNDIRECTED;
        const server_pos = local_board.view.serverCoord2(pos);
        socket.emit("add_vertex", server_pos.x, server_pos.y, (response) => { index_last_created_vertex = response });
    }
    if (last_down === DOWN_TYPE.VERTEX) {
        let vertex = g.vertices.get(last_down_index);
        local_board.view.is_link_creating = true;
        local_board.view.link_creating_start = vertex.canvas_pos;
    }
})

interactor_edge.mousemove = ((canvas, ctx, g, e) => {
    local_board.view.creating_vertex_pos = g.align_position(e, new Set(), canvas);
    return true;
})

interactor_edge.mouseup = ((canvas, ctx, g, e) => {
    local_board.view.is_link_creating = false;
    if (last_down == DOWN_TYPE.VERTEX) {
        let index = g.get_vertex_index_nearby(e);
        if (index !== null && last_down_index != index) { // there is a vertex nearby and it is not the previous one
            socket.emit("add_link", last_down_index, index, "undirected");
        } else {

            if (last_down_index !== index) { // We check if we are not creating a vertex on another one
                let save_last_down_index = last_down_index; // see not below
                const mouse_canvas_coord = g.align_position(e, new Set(), canvas);
                const server_pos = local_board.view.serverCoord2(mouse_canvas_coord);
                socket.emit("add_vertex", server_pos.x, server_pos.y, (response) => {
                    socket.emit("add_link", save_last_down_index, response, "undirected");
                    // we cant do socket.emit("add_edge", interactor_edge.last_down_index, response);
                    // because before the callback, interactor_edge.last_down_index will changed (and set to null)
                });
            }
        }
    } else if (last_down === DOWN_TYPE.EMPTY) {
        let index = g.get_vertex_index_nearby(g.align_position(e, new Set(), canvas));
        if (index !== null && index != index_last_created_vertex) {
            socket.emit("add_link", index_last_created_vertex, index, "undirected");
        } else {
            if (index_last_created_vertex !== index) { // We check if we are not creating another vertex where we created the one with the mousedown 
                const aligned_mouse_pos = g.align_position(e, new Set(), canvas);
                const server_pos = local_board.view.serverCoord2(aligned_mouse_pos);
                socket.emit("add_vertex", server_pos.x, server_pos.y, (response) => {
                    socket.emit("add_link", index_last_created_vertex, response, "undirected");
                });

            }
        }
    }

})

interactor_edge.trigger = (mouse_pos: CanvasCoord) => {
    local_board.view.is_creating_vertex = true;
    local_board.view.creating_vertex_pos = mouse_pos;
}