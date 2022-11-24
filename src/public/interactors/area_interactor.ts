import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import { ClientArea, AREA_CORNER, AREA_SIDE } from '../board/area';
import { down_coord, last_down, last_down_index } from './interactor_manager';
import { local_board } from '../setup';
import { CanvasVect } from '../board/vect';
import { ClientGraph } from '../board/graph';
import { CanvasCoord } from '../board/vertex';
import { Coord } from 'gramoloss';


export var interactor_area = new Interactor("area", "g", "area.svg", new Set([DOWN_TYPE.AREA, DOWN_TYPE.AREA_CORNER, DOWN_TYPE.AREA_SIDE]), 'default')

let is_creating_area : boolean;
let last_created_area_index: number = null;
let is_moving_area : boolean;
let first_corner : Coord;

let side_number: AREA_SIDE;
let corner_number: AREA_CORNER;
let vertices_contained = new Set<number>();
let previous_canvas_shift = new CanvasVect(0,0);
let opposite_corner = new CanvasCoord(0,0);
let opposite_coord = 0;


interactor_area.mousedown = (( canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    if (last_down === DOWN_TYPE.EMPTY) {
        is_creating_area = true;
        first_corner = local_board.view.create_server_coord(e);
        socket.emit("add_area", first_corner.x, first_corner.y, first_corner.x, first_corner.y, "G", "", 
        (response: number) => { last_created_area_index = response });
        opposite_corner = e.copy();
    } else if (last_down === DOWN_TYPE.AREA_CORNER){
        const area = g.areas.get(last_down_index);
        corner_number = area.is_nearby_corner(e);
        switch(corner_number) {
            case AREA_CORNER.TOP_RIGHT: {
                opposite_corner = area.canvas_corner_bottom_left.copy();
                break;
            }
            case AREA_CORNER.BOT_LEFT: {
                opposite_corner = area.canvas_corner_top_right.copy();
                break;
            }
            case AREA_CORNER.BOT_RIGHT: {
                opposite_corner = area.canvas_corner_top_left.copy();
                break;
            }
            case AREA_CORNER.TOP_LEFT: {
                opposite_corner = area.canvas_corner_bottom_right.copy();
                break;
            }
        }
        is_moving_area = true;
    } else  if (last_down === DOWN_TYPE.AREA_SIDE){
        const area = g.areas.get(last_down_index);
        side_number = area.is_nearby_side(e);
        switch(side_number){
            case AREA_SIDE.BOT:{
                opposite_coord = area.canvas_corner_top_left.y;
                break;
            }
            case AREA_SIDE.TOP:{
                opposite_coord = area.canvas_corner_bottom_left.y;
                break;
            }
            case AREA_SIDE.LEFT:{
                opposite_coord = area.canvas_corner_bottom_right.x;
                break;
            }
            case AREA_SIDE.RIGHT:{
                opposite_coord = area.canvas_corner_bottom_left.x;
                break;
            }
        }
        is_moving_area = true;
    } else if ( last_down == DOWN_TYPE.AREA){
        const area = g.areas.get(last_down_index);
        previous_canvas_shift = new CanvasVect(0,0);
        vertices_contained = new Set();
        for (const [vertex_index, vertex] of g.vertices.entries()){
            if ( area.is_containing(vertex)){
                vertices_contained.add(vertex_index);
            }
        }
        is_moving_area = true;
    }
})

interactor_area.mousemove = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {

    if(is_creating_area){
        if( last_created_area_index != null && g.areas.has(last_created_area_index)){
            const last_created_area = g.areas.get(last_created_area_index);
            last_created_area.resize_corner_area(e, opposite_corner, local_board.view);
            return true;
        }
    }
    else if(is_moving_area){
        const moving_area = g.areas.get(last_down_index);
        if(side_number != null){
            moving_area.resize_side_area(e, opposite_coord, side_number, local_board.view)
        }
        else if(corner_number != null)
        {
            moving_area.resize_corner_area(e, opposite_corner, local_board.view);
        } else if ( last_down == DOWN_TYPE.AREA){
            const shift = CanvasVect.from_canvas_coords(down_coord,e);
            g.translate_area(shift.sub(previous_canvas_shift), last_down_index, vertices_contained, local_board.view);
            previous_canvas_shift.set_from(shift);
        }
        return true;
    }
    else{
        let cursor_changed = false;
    
        for (const a of g.areas.values()) {
            const corner_number = a.is_nearby_corner(e);
            const side_number = a.is_nearby_side(e, undefined, true);
            const is_on_label = a.is_nearby(e);

            if(corner_number === AREA_CORNER.NONE && side_number === AREA_SIDE.NONE && !is_on_label){
                continue;
            }
            else{
                cursor_changed = true;
            }

            if(is_on_label){
                canvas.style.cursor="grab";
                break;
            }

            if(corner_number === AREA_CORNER.TOP_LEFT)
            {
                canvas.style.cursor = "nw-resize";
                break;
            }
            if(corner_number === AREA_CORNER.BOT_RIGHT)
            {
                canvas.style.cursor = "se-resize";
                break;
            }
            if(corner_number === AREA_CORNER.TOP_RIGHT)
            {
                canvas.style.cursor = "ne-resize";
                break;
            }
            if(corner_number === AREA_CORNER.BOT_LEFT)
            {
                canvas.style.cursor = "sw-resize";
                break;
            }
    
            if(side_number === AREA_SIDE.TOP){
                canvas.style.cursor = "n-resize";
                break;
            }
            if(side_number === AREA_SIDE.BOT)
            {
                canvas.style.cursor = "s-resize";
                break;
            }

            if(side_number === AREA_SIDE.LEFT){
                canvas.style.cursor = "w-resize";
                break;
            }
            if(side_number === AREA_SIDE.RIGHT)
            {
                canvas.style.cursor = "e-resize";
                break;
            }
    
    
        }
        if(!cursor_changed){
            canvas.style.cursor = "default";
        }
        
        return false;
    }
   
   
})

interactor_area.mouseup = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    const esc  = local_board.view.create_server_coord(e);
    if (last_down === DOWN_TYPE.EMPTY) {
        socket.emit("area_move_corner", last_created_area_index, esc.x, esc.y, AREA_CORNER.TOP_RIGHT);
        is_creating_area = false;
        first_corner = null;
    }
    else if (last_down === DOWN_TYPE.AREA_SIDE){
        socket.emit("area_move_side", last_down_index, esc.x, esc.y, side_number);      
        side_number = null;
        is_moving_area = false;
    }
    else if (last_down === DOWN_TYPE.AREA_CORNER){
        socket.emit("area_move_corner", last_down_index, esc.x, esc.y, corner_number);  
        corner_number = null;
        is_moving_area = false;
    }
    else if ( last_down == DOWN_TYPE.AREA){
        const canvas_shift = CanvasVect.from_canvas_coords(down_coord, e);
        const shift = local_board.view.server_vect(canvas_shift);
        socket.emit("translate_areas", [last_down_index], shift.x, shift.y);
        is_moving_area = false;
    }
})


