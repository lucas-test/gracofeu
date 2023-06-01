import { BoardElementType } from "../../board/board";
import { ClientGraph } from "../../board/graph";
import { is_click_over } from "../../board/resizable";
import { CanvasCoord } from "../../board/vertex";
import { VERTEX_RADIUS } from "../../draw";
import { draw_circle } from "../../draw_basics";
import { DOWN_TYPE } from "../../interactors/interactor";
import { mouse_pos } from "../../interactors/interactor_manager";
import { local_board } from "../../setup";
import { ORIENTATION_INFO } from "../element_side_bar";
import { InteractorV2 } from "../interactor_side_bar";

// INTERACTOR ERASER

let is_erasing = false;
const erase_distance = 8;

export const eraser_interactorV2 = new InteractorV2("eraser", "Erase objects", "r", ORIENTATION_INFO.RIGHT, "img/interactors/eraser.svg", 'url("../img/cursors/eraser.svg"), auto', new Set([DOWN_TYPE.STROKE]));

// return true if somethin has been erased
function erase_at(g: ClientGraph, e: CanvasCoord) : boolean{
    for (const [index, s] of local_board.strokes.entries()) {
        if (s.is_nearby(e, local_board.view) !== false) {
            local_board.emit_delete_elements([[BoardElementType.Stroke, index]]);
            return true;
        }
    }
    for (const [index, vertex] of g.vertices.entries()) {
        if (vertex.is_nearby(e, Math.pow(erase_distance + VERTEX_RADIUS, 2))) {
            local_board.emit_delete_elements([[BoardElementType.Vertex, index]]);
            return true;
        }
    }
    for (const index of g.links.keys()) {
        if (g.is_click_over_link(index, e, local_board.view)) {
            local_board.emit_delete_elements([[BoardElementType.Link, index]]);
            return true;
        }
    }
    for(const [index,area] of local_board.areas.entries()){
        if( is_click_over(area,e) ){
            local_board.emit_delete_elements([[BoardElementType.Area, index]]);
            return true;
        }
    }
    return false;
}

eraser_interactorV2.mousedown = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    erase_at(g,e);
    is_erasing = true;
})

eraser_interactorV2.mousemove = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    if (is_erasing) {
        erase_at(g, e);
    }
    return true;
})

eraser_interactorV2.mouseup = ((canvas, ctx, g, e) => {
    is_erasing = false;
})

eraser_interactorV2.draw = ((ctx) => {
    draw_circle(mouse_pos, "white", erase_distance, 0.4, ctx);
})