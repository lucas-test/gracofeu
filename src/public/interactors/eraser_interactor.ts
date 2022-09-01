import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import { mouse_pos } from './interactor_manager';
import { draw_circle } from '../draw_basics';
import { VERTEX_RADIUS } from '../draw';
import { CanvasCoord } from '../board/coord';
import { Graph } from '../board/graph';


// INTERACTOR ERASER

var is_erasing = false;
const erase_distance = 8;

export var interactor_eraser = new Interactor("eraser", "r", "eraser.svg", new Set([DOWN_TYPE.STROKE]), 'url("../img/cursors/eraser.svg"), auto')

// return true if somethin has been erased
function erase_at(g: Graph, e: CanvasCoord) : boolean{
    for (const [index, s] of g.strokes.entries()) {
        if (s.is_nearby(e) !== false) {
            socket.emit("delete_stroke", index);
            return true;
        }
    }
    for (const [index, vertex] of g.vertices.entries()) {
        if (vertex.is_nearby(e, Math.pow(erase_distance + VERTEX_RADIUS, 2))) {
            const data_socket = new Array();
            data_socket.push({ type: "vertex", index: index });
            socket.emit("delete_selected_elements", data_socket);
            return true;
        }
    }
    for (const index of g.links.keys()) {
        if (g.is_click_over_link(index, e)) {
            const data_socket = new Array();
            data_socket.push({ type: "link", index: index });
            socket.emit("delete_selected_elements", data_socket);
            return true;
        }
    }
    return false;
}

interactor_eraser.mousedown = ((canvas, ctx, g, e) => {
    erase_at(g,e);
    is_erasing = true;
})

interactor_eraser.mousemove = ((canvas, ctx, g, e) => {
    if (is_erasing) {
        erase_at(g, e);
    }
    return true;
})

interactor_eraser.mouseup = ((canvas, ctx, g, e) => {
    is_erasing = false;
})

interactor_eraser.draw = ((ctx) => {
    draw_circle(mouse_pos, "white", erase_distance, 0.4, ctx);
})