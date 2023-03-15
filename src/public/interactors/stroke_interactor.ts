import {Interactor,DOWN_TYPE} from './interactor'
import { local_board } from '../setup';
import { ClientGraph } from '../board/graph';
import { CanvasCoord } from '../board/vertex';
import { ClientStroke } from '../board/stroke';
import { Stroke } from 'gramoloss';


// INTERACTOR STROKE

var last_stroke = null;
// var begin_last_stroke = null;
var index_last_stroke = null;
var gap_refresh = 0;
const sample_period = 3; // number of frames between two points, skipping the others; 3 is empirically a good value


export var interactor_stroke = new Interactor("pen", "p", "stroke.svg", new Set([DOWN_TYPE.VERTEX]), 'default');

interactor_stroke.mousedown = ((  canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
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

interactor_stroke.mousemove = ((canvas, ctx, g, e) => {
    if(last_stroke !== null){
        gap_refresh++ ;
        if(gap_refresh % sample_period === 0){
            local_board.strokes.get(index_last_stroke).push(e, local_board.view);
            return true;
        }
    }
    return false;

})

interactor_stroke.mouseup = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    local_board.strokes.get(index_last_stroke).push(e, local_board.view);

    const s = local_board.strokes.get(index_last_stroke);
    local_board.emit_add_element( s, (response: number) => { })

    last_stroke = null;
    index_last_stroke = null;
    gap_refresh = 0;
})