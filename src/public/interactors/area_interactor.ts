

import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import { view } from '../camera';
import { CanvasCoord, Coord } from '../local_graph';
import { Area } from '../area';


// INTERACTOR SELECTION

export var interactor_area = new Interactor("area", "g", "selection.svg")
let down_coord: CanvasCoord; // à rajouter dans Interactor
let previous_camera: Coord;
let is_creating_area : boolean;
let first_corner : CanvasCoord;


interactor_area.mousedown = ((down_type, down_element_index, canvas, ctx, g, e) => {
     if (down_type === DOWN_TYPE.EMPTY) {
            is_creating_area = true;
            first_corner = e;
        }
})

interactor_area.mousemove = ((canvas, ctx, g, e) => {
    // TODO: Animation
    return false;
   
})

interactor_area.mouseup = ((canvas, ctx, g, e) => {

    if (is_creating_area) {
        if (interactor_area.last_down === DOWN_TYPE.EMPTY) {
            is_creating_area = false;
            let index = 0;
            while (g.areas.has(index)) {
                index += 1;
            }

            g.areas.set(index, new Area("G", view.serverCoord2(first_corner), view.serverCoord2(e)));
        }

    }
})


