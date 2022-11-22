import {Interactor,DOWN_TYPE} from './interactor'
import {socket} from '../socket';
import { local_board } from '../setup';
import { ClientGraph } from '../board/graph';
import { CanvasCoord } from '../board/vertex';
import { ClientStroke } from '../board/stroke';


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
    while (g.strokes.has(index)) {
        index += 1;
    }
    index_last_stroke = index;
    g.strokes.set(index_last_stroke, last_stroke);
})

interactor_stroke.mousemove = ((canvas, ctx, g, e) => {
    if(last_stroke !== null){
        gap_refresh++ ;
        if(gap_refresh % sample_period === 0){
            g.strokes.get(index_last_stroke).push(e, local_board.view);
            return true;
        }
    }
    return false;

})

interactor_stroke.mouseup = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    g.strokes.get(index_last_stroke).push(e, local_board.view);

    const s = g.strokes.get(index_last_stroke);

    // const data_socket = new Array();
    // data_socket.push({ 
    //     positions: [... s.positions.entries()], 
    //     old_pos: s.old_pos, 
    //     color: s.color, 
    //     width : s.width, 
    //     min_x : s.min_x, 
    //     max_x : s.max_x, 
    //     min_y : s.min_y,
    //     max_y : s.max_y
    // });
    // socket.emit("add_stroke", data_socket);

    socket.emit("add_stroke", [... s.positions.entries()], s.color, s.width, s.top_left, s.bot_right);

    last_stroke = null;
    index_last_stroke = null;
    gap_refresh = 0;
})