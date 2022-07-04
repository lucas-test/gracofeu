import {Interactor,DOWN_TYPE} from './interactor'
import {socket} from '../socket';
import {view} from '../camera';
import {CanvasCoord,local_graph,ORIENTATION} from '../local_graph';
import {Stroke} from '../stroke';


// INTERACTOR STROKE

var last_stroke = null;
var begin_last_stroke = null;
var index_last_stroke = null;
var gap_refresh = 0;


export var interactor_stroke = new Interactor("pen", "p", "stroke.svg");

interactor_stroke.mousedown = ((d, k, canvas, ctx, g, e) => {
    const server_pos = view.serverCoord2(e);

    last_stroke = new Stroke(server_pos, "#ffffff", 2, null);
    begin_last_stroke = last_stroke;

    // TO CHANGE
    let index = 0;
    while (g.strokes.has(index)) {
        index += 1;
    }
    index_last_stroke = index;
    g.strokes.set(index_last_stroke, begin_last_stroke);
})

interactor_stroke.mousemove = ((canvas, ctx, g, e) => {
    gap_refresh++ ;
    if(gap_refresh % 5 === 0){
    const server_pos = view.serverCoord2(e);
    last_stroke = new Stroke(server_pos, "#ffffff", 2, last_stroke);
    return true;}
    return false;

})

interactor_stroke.mouseup = ((canvas, ctx, g, e) => {
    const server_pos = view.serverCoord2(e);
    last_stroke = new Stroke(server_pos, "#ffffff", 2, last_stroke);
    last_stroke.set_last(last_stroke);

    last_stroke = null;
    begin_last_stroke = null;
    index_last_stroke = null;
    gap_refresh = 0;
})