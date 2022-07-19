import {Interactor,DOWN_TYPE} from './interactor'
import {socket} from '../socket';
import {view} from '../camera';
import {CanvasCoord,local_graph,ORIENTATION} from '../local_graph';
import {Stroke} from '../stroke';


// INTERACTOR ERASER

var is_erasing = false;

export var interactor_eraser = new Interactor("eraser", "r", "eraser.svg", new Set([DOWN_TYPE.STROKE]));

interactor_eraser.mousedown = ((d, k, canvas, ctx, g, e) => {
    if(d === DOWN_TYPE.STROKE){
        g.strokes.delete(interactor_eraser.last_down_index);
    }
    is_erasing = true;
})

interactor_eraser.mousemove = ((canvas, ctx, g, e) => {
    if(is_erasing){
        for(const [index,s] of g.strokes.entries()){
            // const canvas_coord = view.ca(e);
            if(s.is_nearby(e, 50) !== false){
                console.log("CLOSE!!");
                g.strokes.delete(index);
                return true;
            }
        }
    }
    return false;
})

interactor_eraser.mouseup = ((canvas, ctx, g, e) => {
    is_erasing = false;
})