import {Interactor,DOWN_TYPE} from './interactor'
import {socket} from '../socket';
import {ORIENTATION} from '../board/local_graph';
import {Stroke} from '../board/stroke';
import { local_board } from '../setup';


// INTERACTOR STROKE

var last_stroke = null;
// var begin_last_stroke = null;
var index_last_stroke = null;
var gap_refresh = 0;


export var interactor_stroke = new Interactor("pen", "p", "stroke.svg", new Set([DOWN_TYPE.VERTEX]));

interactor_stroke.mousedown = ((  canvas, ctx, g, e) => {
    const server_pos = local_board.view.serverCoord2(e);
    last_stroke = new Stroke([server_pos], "#ffffff", 2);

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
        if(gap_refresh % 5 === 0){
            const server_pos = local_board.view.serverCoord2(e);
            g.strokes.get(index_last_stroke).push(server_pos);
            return true;
        }
    }
    return false;

})

interactor_stroke.mouseup = ((canvas, ctx, g, e) => {
    const server_pos = local_board.view.serverCoord2(e);
    g.strokes.get(index_last_stroke).push(server_pos);

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

    socket.emit("add_stroke", [... s.positions.entries()], s.old_pos, s.multicolor.color, s.width, s.top_left, s.bot_right);

    last_stroke = null;
    index_last_stroke = null;
    gap_refresh = 0;
})