

import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import { view } from '../camera';
import { Area } from '../area';
import { CanvasCoord, Coord } from '../coord';


// INTERACTOR SELECTION

export var interactor_area = new Interactor("area", "g", "area.svg", new Set([DOWN_TYPE.AREA, DOWN_TYPE.AREA_CORNER, DOWN_TYPE.AREA_SIDE]))
let down_coord: CanvasCoord; // à rajouter dans Interactor
let previous_camera: Coord;
let is_creating_area : boolean;
let first_corner : CanvasCoord;

let side_number;
let corner_number;
let last_down_index : number;


interactor_area.mousedown = ((down_type, down_element_index, canvas, ctx, g, e) => {
    if (down_type === DOWN_TYPE.EMPTY) {
        is_creating_area = true;
        first_corner = e;
    }

    if (down_type === DOWN_TYPE.AREA_CORNER){
        const area = g.areas.get(down_element_index);
        corner_number = area.is_nearby_corner(e);
        last_down_index = down_element_index;
    }

    if (down_type === DOWN_TYPE.AREA_SIDE){
        const area = g.areas.get(down_element_index);
        side_number = area.is_nearby_side(e, 5);
        last_down_index = down_element_index;
    }
})

interactor_area.mousemove = ((canvas, ctx, g, e) => {
    // TODO: Animation
    return false;
   
})

interactor_area.mouseup = ((canvas, ctx, g, e) => {
    const c2  = view.serverCoord2(e);
    if (is_creating_area) {
        if (interactor_area.last_down === DOWN_TYPE.EMPTY) {
            if(first_corner.dist2(e) > 10){
                const c1 = view.serverCoord2(first_corner);
                socket.emit("add_area", c1.x, c1.y, c2.x, c2.y, "G", null);
            }
            is_creating_area = false;
            first_corner = null;
        }
    }
    else if (interactor_area.last_down === DOWN_TYPE.AREA_SIDE){
        socket.emit("area_move_side", last_down_index, c2.x, c2.y, side_number);      
        side_number = null;
    }
    else if (interactor_area.last_down === DOWN_TYPE.AREA_CORNER){
        socket.emit("area_move_corner", last_down_index, c2.x, c2.y, corner_number);  
        corner_number = null;
    }
})


