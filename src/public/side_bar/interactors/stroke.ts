

// INTERACTOR STROKE

import { ClientGraph } from "../../board/graph";
import { ClientStroke } from "../../board/stroke";
import { CanvasCoord } from "../../board/vertex";
import { DOWN_TYPE } from "../../interactors/interactor";
import { local_board } from "../../setup";
import { ORIENTATION_INFO } from "../element_side_bar";
import { InteractorV2 } from "../interactor_side_bar";

let last_stroke = null;
// var begin_last_stroke = null;
let index_last_stroke = null;
let gap_refresh = 0;
const sample_period = 3; // number of frames between two points, skipping the others; 3 is empirically a good value


export const stroke_interactorV2 = new InteractorV2("pen", "Pen", "p", ORIENTATION_INFO.LEFT, "img/interactors/stroke.svg", "default", new Set([DOWN_TYPE.VERTEX]));

stroke_interactorV2.mousedown = ((  canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    const server_pos = local_board.view.create_server_coord(e);
    last_stroke = new ClientStroke([server_pos], "black", 2, local_board.view);

    // TO CHANGE
    let index = 0;
    while (local_board.strokes.has(index)) {
        index += 1;
    }
    index_last_stroke = index;
    local_board.strokes.set(index_last_stroke, last_stroke);
})

stroke_interactorV2.mousemove = ((canvas, ctx, g, e) => {
    if(last_stroke !== null){
        gap_refresh++ ;
        if(gap_refresh % sample_period === 0){
            local_board.strokes.get(index_last_stroke).push(e, local_board.view);
            return true;
        }
    }
    return false;

})

stroke_interactorV2.mouseup = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    local_board.strokes.get(index_last_stroke).push(e, local_board.view);

    const s = local_board.strokes.get(index_last_stroke);
    local_board.emit_add_element( s, (response: number) => { })

    last_stroke = null;
    index_last_stroke = null;
    gap_refresh = 0;
})