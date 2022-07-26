import {Interactor,DOWN_TYPE} from './interactor'
import {socket} from '../socket';
import {Stroke} from '../board/stroke';
import { last_down, last_down_index } from './interactor_manager';


// INTERACTOR ERASER

var is_erasing = false;

export var interactor_eraser = new Interactor("eraser", "r", "eraser.svg", new Set([DOWN_TYPE.STROKE]));

interactor_eraser.mousedown = (( canvas, ctx, g, e) => {
    if(last_down === DOWN_TYPE.STROKE){
        g.strokes.delete(last_down_index);
    }
    is_erasing = true;
})

interactor_eraser.mousemove = ((canvas, ctx, g, e) => {
    if(is_erasing){
        for(const [index,s] of g.strokes.entries()){
            // const canvas_coord = view.ca(e);
            if(s.is_nearby(e) !== false){
                // console.log("CLOSE!!");
                // g.strokes.delete(index);
                socket.emit("delete_stroke", index);
                return true;
            }
        }
    }
    return false;
})

interactor_eraser.mouseup = ((canvas, ctx, g, e) => {
    is_erasing = false;
})