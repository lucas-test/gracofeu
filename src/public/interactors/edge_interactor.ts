
import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import { view } from '../camera';
import { CanvasCoord, local_graph, ORIENTATION } from '../local_graph';


// INTERACTOR EDGE

var index_last_created_vertex = null; // est ce qu'on peut pas intégrer ça dans interactor_edge directement ?


export var interactor_edge = new Interactor("edge", "e", "edition.svg");

interactor_edge.mousedown = ((d, k, canvas, ctx, g, e) => {
    if (d == DOWN_TYPE.EMPTY) {
        view.is_link_creating = true;

        const mouse_canvas_coord = e; // faut peut etre copier
        const pos = mouse_canvas_coord;
        g.align_position(pos, mouse_canvas_coord, new Set(), canvas);

        view.link_creating_start = pos;
        view.link_creating_type = ORIENTATION.UNDIRECTED;
        const server_pos = view.serverCoord2(pos);
        socket.emit("add_vertex", server_pos.x, server_pos.y, (response) => { index_last_created_vertex = response });
    }
    if (d === DOWN_TYPE.VERTEX) {
        let vertex = g.vertices.get(interactor_edge.last_down_index);
        view.is_link_creating = true;
        view.link_creating_start = vertex.canvas_pos;
    }
})

interactor_edge.mousemove = ((canvas, ctx, g, e) => {
    const u = e; // faut peut etre copier
    g.align_position(u, u, new Set(), canvas);
    view.creating_vertex_pos = u;
    return true;
})

interactor_edge.mouseup = ((canvas, ctx, g, e) => {
    view.is_link_creating = false;
    if (interactor_edge.last_down == DOWN_TYPE.VERTEX) {
        let index = g.get_vertex_index_nearby(e);
        if (index !== null && interactor_edge.last_down_index != index) { // there is a vertex nearby and it is not the previous one
            socket.emit("add_link", interactor_edge.last_down_index, index, "undirected");
        } else {

            if (interactor_edge.last_down_index !== index) { // We check if we are not creating a vertex on another one
                let save_last_down_index = interactor_edge.last_down_index; // see not below
                const mouse_canvas_coord = e; // faut peut etre copier
                g.align_position(mouse_canvas_coord, mouse_canvas_coord, new Set(), canvas);
                const server_pos = view.serverCoord2(mouse_canvas_coord);
                socket.emit("add_vertex", server_pos.x, server_pos.y, (response) => {
                    socket.emit("add_link", save_last_down_index, response, "undirected");
                    // we cant do socket.emit("add_edge", interactor_edge.last_down_index, response);
                    // because before the callback, interactor_edge.last_down_index will changed (and set to null)
                });
            }
        }
    } else if (interactor_edge.last_down === DOWN_TYPE.EMPTY) {
        let index = g.get_vertex_index_nearby(e);
        if (index !== null && index != index_last_created_vertex) {
            socket.emit("add_link", index_last_created_vertex, index, "undirected");
        } else {
            if (index_last_created_vertex !== index) { // We check if we are not creating another vertex where we created the one with the mousedown 
                const mouse_canvas_coord = e; // faut peut etre copier
                g.align_position(mouse_canvas_coord, mouse_canvas_coord, new Set(), canvas);
                const server_pos = view.serverCoord2(mouse_canvas_coord);
                socket.emit("add_vertex", server_pos.x, server_pos.y, (response) => {
                    socket.emit("add_link", index_last_created_vertex, response, "undirected");
                });

            }
        }
    }

})

interactor_edge.trigger = (mouse_pos: CanvasCoord) =>{
    view.is_creating_vertex = true;
    view.creating_vertex_pos = mouse_pos;
}