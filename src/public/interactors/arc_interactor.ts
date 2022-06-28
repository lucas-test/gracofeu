import { view } from "../camera";
import { draw } from "../draw";
import { CanvasCoord, local_graph, ORIENTATION } from "../local_graph";
import { socket } from "../socket";
import { DOWN_TYPE, Interactor } from "./interactor";

export var interactor_arc = new Interactor("arc", "a", "arc.svg");

var index_last_created_vertex = null; // est ce qu'on peut pas intégrer ça dans interactor_edge directement ?


interactor_arc.mousedown = ((d, k, canvas, ctx, g, e) => {
    if (d == DOWN_TYPE.EMPTY) {
        view.is_link_creating = true;
        view.link_creating_start = new CanvasCoord(e.pageX, e.pageY);
        view.link_creating_type = ORIENTATION.DIRECTED;
        socket.emit("add_vertex", view.serverCoord(e).x, view.serverCoord(e).y, (response) => { index_last_created_vertex = response });
    }
    if (d === DOWN_TYPE.VERTEX) {
        let vertex = g.vertices.get(interactor_arc.last_down_index);
        view.is_link_creating = true;
        view.link_creating_start = view.canvasCoord(vertex.pos);
    }
})

interactor_arc.mousemove = ((canvas, ctx, g, e) => {
    const u = view.serverCoord(e);
    g.align_position(u, u, new Set());
    view.creating_vertex_pos = view.canvasCoord(u);
    return true;
})

interactor_arc.mouseup = ((canvas, ctx, g, e) => {
    view.is_link_creating = false;
    if (interactor_arc.last_down == DOWN_TYPE.VERTEX) {
        let index = g.get_vertex_index_nearby(view.canvasCoordFromMouse(e));
        if (index !== null && interactor_arc.last_down_index != index) { // there is a vertex nearby and it is not the previous one
            socket.emit("add_link", interactor_arc.last_down_index, index, "directed");
        } else {

            if (interactor_arc.last_down_index !== index) { // We check if we are not creating a vertex on another one
                let save_last_down_index = interactor_arc.last_down_index; // see note below
                socket.emit("add_vertex", view.serverCoord(e).x, view.serverCoord(e).y, (response) => {
                    socket.emit("add_link", save_last_down_index, response, "directed");
                    // we cant do socket.emit("add_edge", interactor_edge.last_down_index, response);
                    // because before the callback, interactor_edge.last_down_index will changed (and set to null)
                });
            }
        }
    } else if (interactor_arc.last_down === DOWN_TYPE.EMPTY) {
        let index = g.get_vertex_index_nearby(view.canvasCoordFromMouse(e));
        if (index !== null && index != index_last_created_vertex) {
            socket.emit("add_link", index_last_created_vertex, index, "directed");
        } else {
            if (index_last_created_vertex !== index) { // We check if we are not creating another vertex where we created the one with the mousedown 
                socket.emit("add_vertex", view.serverCoord(e).x, view.serverCoord(e).y, (response) => {
                    socket.emit("add_link", index_last_created_vertex, response, "directed");
                });

            }
        }
    }

})

interactor_arc.trigger = (mouse_pos: CanvasCoord) =>{
    view.is_creating_vertex = true;
    view.creating_vertex_pos = mouse_pos;
}