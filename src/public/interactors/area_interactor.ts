import { Interactor, DOWN_TYPE, RESIZE_TYPE } from './interactor'
import { socket } from '../socket';
import { AREA_CORNER, AREA_SIDE } from '../board/area';
import { down_coord, last_down, last_down_index } from './interactor_manager';
import { local_board } from '../setup';
import { CanvasVect } from '../board/vect';
import { ClientGraph } from '../board/graph';
import { CanvasCoord } from '../board/vertex';
import { Coord } from 'gramoloss';


export var interactor_area = new Interactor("area", "g", "area.svg", new Set([DOWN_TYPE.AREA]), 'default')

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
        // socket.emit("add_area", first_corner.x, first_corner.y, first_corner.x, first_corner.y, "G", "", 
        // (response: number) => { last_created_area_index = response });
        socket.emit("add_element", "Area", {c1: first_corner, c2: first_corner, label: "G", color:"" }, (response: number) => { console.log("hey", response); last_created_area_index = response })
        opposite_corner = e.copy();
    } else if ( last_down == DOWN_TYPE.AREA){
        const area = local_board.areas.get(last_down_index);
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
        if( last_created_area_index != null && local_board.areas.has(last_created_area_index)){
            const last_created_area = local_board.areas.get(last_created_area_index);
            last_created_area.resize_corner_area(e, opposite_corner, local_board.view);
            return true;
        }
    }
    else if(is_moving_area){
        const moving_area = local_board.areas.get(last_down_index);
        if(side_number != null){
            moving_area.resize_side_area(e, opposite_coord, side_number, local_board.view)
        }
        else if(corner_number != null)
        {
            moving_area.resize_corner_area(e, opposite_corner, local_board.view);
        } else if ( last_down == DOWN_TYPE.AREA){
            const shift = CanvasVect.from_canvas_coords(down_coord,e);
            local_board.translate_area(shift.sub(previous_canvas_shift), last_down_index, vertices_contained);
            previous_canvas_shift.set_from(shift);
        }
        return true;
    }
    else{
        let cursor_changed = false;
    
        for (const a of local_board.areas.values()) {
            const corner_number = a.is_nearby_corner(e);
            const side_number = a.is_nearby_side(e, undefined, true);
            const is_on_label = a.is_on_label(e);

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
        socket.emit("resize_element", "Area", last_created_area_index, esc.x, esc.y, RESIZE_TYPE.TOP_RIGHT);
        is_creating_area = false;
        first_corner = null;
    }
    else if ( last_down == DOWN_TYPE.AREA){
        const canvas_shift = CanvasVect.from_canvas_coords(down_coord, e);
        const shift = local_board.view.server_vect(canvas_shift);
        // socket.emit("translate_areas", [last_down_index], shift.x, shift.y);
        local_board.translate_area(canvas_shift.opposite(), last_down_index, vertices_contained);
        socket.emit("translate_elements",[["Area", last_down_index]], shift);
        is_moving_area = false;
    }
})


