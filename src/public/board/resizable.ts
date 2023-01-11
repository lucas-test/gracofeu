import { Coord } from "gramoloss";
import { RESIZE_TYPE } from "../interactors/interactor";
import { View } from "./camera";
import { CanvasVect } from "./vect";
import { CanvasCoord } from "./vertex";

export interface Resizable {
    c1: Coord,
    c2: Coord,
    canvas_corner_bottom_left: CanvasCoord,
    canvas_corner_top_right: CanvasCoord,
    canvas_corner_top_left: CanvasCoord,
    canvas_corner_bottom_right: CanvasCoord
}

export function translate_by_canvas_vect<R extends Resizable>(element: R, shift: CanvasVect, view: View){
    element.canvas_corner_bottom_left.translate_by_canvas_vect(shift);
    element.canvas_corner_bottom_right.translate_by_canvas_vect(shift);
    element.canvas_corner_top_left.translate_by_canvas_vect(shift);
    element.canvas_corner_top_right.translate_by_canvas_vect(shift);
    element.c1.translate(view.server_vect(shift));
    element.c2.translate(view.server_vect(shift));
}

export function is_click_over<R extends Resizable>(element: R, pos: CanvasCoord){
    return element.canvas_corner_bottom_left.x <= pos.x && pos.x <= element.canvas_corner_bottom_right.x && element.canvas_corner_top_left.y <= pos.y && pos.y <= element.canvas_corner_bottom_right.y;
}

export function resize_type_nearby<R extends Resizable>(element: R, pos: CanvasCoord, r?:number): RESIZE_TYPE | number{
    if(r == undefined){
        r = 5;
    }

    const TL = element.canvas_corner_top_left;
    if ( TL.x <= pos.x && pos.x <= TL.x + r &&  TL.y <= pos.y && pos.y <= TL.y + r){
        return RESIZE_TYPE.TOP_LEFT;
    }

    const TR = element.canvas_corner_top_right;
    if( pos.x <= TR.x && pos.x >= TR.x - r && pos.y >= TR.y && pos.y <= TR.y + r){
        return RESIZE_TYPE.TOP_RIGHT;
    }

    const BR = element.canvas_corner_bottom_right;
    if( pos.x <= BR.x && pos.x >= BR.x - r && pos.y >= BR.y - r && pos.y <= BR.y){
        return RESIZE_TYPE.BOTTOM_RIGHT;
    }

    const BL = element.canvas_corner_bottom_left;
    if( pos.x >= BL.x && pos.x <= BL.x + r && pos.y >= BL.y - r && pos.y <= BL.y){
        return RESIZE_TYPE.BOTTOM_LEFT
    }

    const c1canvas = element.canvas_corner_bottom_left;
    const c2canvas = element.canvas_corner_top_right;
    const minX = Math.min(c1canvas.x, c2canvas.x);
    const minY = Math.min(c1canvas.y, c2canvas.y);
    const maxX = Math.max(c1canvas.x, c2canvas.x);
    const maxY = Math.max(c1canvas.y, c2canvas.y);

    let shift = 20;

    if(pos.x < maxX - shift && pos.x > minX + shift && Math.abs(pos.y - minY) < r){
        return RESIZE_TYPE.TOP;
    }
    if(pos.y < maxY - shift && pos.y > minY + shift && Math.abs(pos.x - maxX) < r){
        return RESIZE_TYPE.RIGHT;
    }
    if(pos.x < maxX - shift && pos.x > minX + shift && Math.abs(pos.y - maxY) < r){
        return RESIZE_TYPE.BOTTOM;
    }
    if(pos.y < maxY - shift && pos.y > minY + shift && Math.abs(pos.x - minX) < r){
        return RESIZE_TYPE.LEFT;
    }

    return 0;
}


export function resize_side<R extends Resizable>(element: R, pos: CanvasCoord, opposite_coord: number, resize_type: RESIZE_TYPE, view: View){
    if (resize_type == RESIZE_TYPE.TOP || resize_type == RESIZE_TYPE.BOTTOM){
        element.canvas_corner_top_right.y = Math.min(pos.y, opposite_coord);
        element.canvas_corner_top_left.y = Math.min(pos.y, opposite_coord);
        element.canvas_corner_bottom_right.y = Math.max(pos.y, opposite_coord);
        element.canvas_corner_bottom_left.y = Math.max(pos.y, opposite_coord);
    }
    if (resize_type == RESIZE_TYPE.LEFT || resize_type == RESIZE_TYPE.RIGHT){
        element.canvas_corner_top_right.x = Math.max(pos.x, opposite_coord);
        element.canvas_corner_top_left.x = Math.min(pos.x, opposite_coord);
        element.canvas_corner_bottom_right.x = Math.max(pos.x, opposite_coord);
        element.canvas_corner_bottom_left.x = Math.min(pos.x, opposite_coord);
    }

    element.c1 = view.create_server_coord(element.canvas_corner_top_left);
    element.c2 = view.create_server_coord(element.canvas_corner_bottom_right);
}

export function resize_corner<R extends Resizable>(element: R, c1: CanvasCoord, c2: CanvasCoord, view: View){
    element.canvas_corner_top_right.x = Math.max(c1.x, c2.x);
    element.canvas_corner_top_right.y = Math.min(c1.y, c2.y);
    element.canvas_corner_top_left.x = Math.min(c1.x, c2.x);
    element.canvas_corner_top_left.y = Math.min(c1.y, c2.y);
    element.canvas_corner_bottom_right.x = Math.max(c1.x, c2.x);
    element.canvas_corner_bottom_right.y = Math.max(c1.y, c2.y);
    element.canvas_corner_bottom_left.x = Math.min(c1.x, c2.x);
    element.canvas_corner_bottom_left.y = Math.max(c1.y, c2.y);

    element.c1 = view.create_server_coord(element.canvas_corner_top_left);
    element.c2 = view.create_server_coord(element.canvas_corner_bottom_right);
}