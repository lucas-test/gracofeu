import { Coord } from "gramoloss";
import { ClientGraph } from "../../board/graph";
import { ClientRectangle } from "../../board/rectangle";
import { CanvasCoord } from "../../board/vertex";
import { local_board } from "../../setup";
import { DOWN_TYPE, Interactor } from "../interactor";
import { last_down } from "../interactor_manager";


export var interactor_rectangle = new Interactor("rectangle", "r", "rectangle.svg", new Set([]), 'default')

// let is_creating_area : boolean;
// let last_created_area_index: number = null;
// let is_moving_area : boolean;
let first_corner : Coord;

// let side_number: AREA_SIDE;
// let corner_number: AREA_CORNER;
// let vertices_contained = new Set<number>();
// let previous_canvas_shift = new CanvasVect(0,0);
let opposite_corner = new CanvasCoord(0,0);
// let opposite_coord = 0;

let index_rectangle : number | string = "";


interactor_rectangle.mousedown = (( canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    if (last_down === DOWN_TYPE.EMPTY) {
        // is_creating_area = true;
        first_corner = local_board.view.create_server_coord(e);
        // socket.emit("add_element", "Area", {c1: first_corner, c2: first_corner, label: "G", color:"" }, (response: number) => { console.log("hey", response); last_created_area_index = response })
        opposite_corner = e.copy();
        index_rectangle = local_board.get_next_available_index_rectangle();
        const client_rectangle = new ClientRectangle(first_corner, first_corner, local_board.view);
        local_board.rectangles.set(index_rectangle, client_rectangle);
    } 
})

interactor_rectangle.mousemove = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {

    if ( typeof index_rectangle !== "string")
    {
        local_board.rectangles.get(index_rectangle).resize_corner_area(local_board.view.create_canvas_coord(first_corner), e, local_board.view);
        return true;   
    }

    return false;
    // if(is_creating_area){
    //     if( last_created_area_index != null && local_board.areas.has(last_created_area_index)){
    //         const last_created_area = local_board.areas.get(last_created_area_index);
            // last_created_area.resize_corner_area(e, opposite_corner, local_board.view);
    //         return true;
    //     }
    // }
    // else if(is_moving_area){
    //     const moving_area = local_board.areas.get(last_down_index);
    //     if(side_number != null){
    //         moving_area.resize_side_area(e, opposite_coord, side_number, local_board.view)
    //     }
    //     else if(corner_number != null)
    //     {
    //         moving_area.resize_corner_area(e, opposite_corner, local_board.view);
    //     } else if ( last_down == DOWN_TYPE.AREA){
    //         const shift = CanvasVect.from_canvas_coords(down_coord,e);
    //         local_board.translate_area(shift.sub(previous_canvas_shift), last_down_index, vertices_contained, local_board.view);
    //         previous_canvas_shift.set_from(shift);
    //     }
    //     return true;
    // }
    // else{
    //     let cursor_changed = false;
    
    //     for (const a of local_board.areas.values()) {
    //         const corner_number = a.is_nearby_corner(e);
    //         const side_number = a.is_nearby_side(e, undefined, true);
    //         const is_on_label = a.is_nearby(e);

    //         if(corner_number === AREA_CORNER.NONE && side_number === AREA_SIDE.NONE && !is_on_label){
    //             continue;
    //         }
    //         else{
    //             cursor_changed = true;
    //         }

    //         if(is_on_label){
    //             canvas.style.cursor="grab";
    //             break;
    //         }

    //         if(corner_number === AREA_CORNER.TOP_LEFT)
    //         {
    //             canvas.style.cursor = "nw-resize";
    //             break;
    //         }
    //         if(corner_number === AREA_CORNER.BOT_RIGHT)
    //         {
    //             canvas.style.cursor = "se-resize";
    //             break;
    //         }
    //         if(corner_number === AREA_CORNER.TOP_RIGHT)
    //         {
    //             canvas.style.cursor = "ne-resize";
    //             break;
    //         }
    //         if(corner_number === AREA_CORNER.BOT_LEFT)
    //         {
    //             canvas.style.cursor = "sw-resize";
    //             break;
    //         }
    
    //         if(side_number === AREA_SIDE.TOP){
    //             canvas.style.cursor = "n-resize";
    //             break;
    //         }
    //         if(side_number === AREA_SIDE.BOT)
    //         {
    //             canvas.style.cursor = "s-resize";
    //             break;
    //         }

    //         if(side_number === AREA_SIDE.LEFT){
    //             canvas.style.cursor = "w-resize";
    //             break;
    //         }
    //         if(side_number === AREA_SIDE.RIGHT)
    //         {
    //             canvas.style.cursor = "e-resize";
    //             break;
    //         }
    
    
    //     }
    //     if(!cursor_changed){
    //         canvas.style.cursor = "default";
    //     }
        
    //     return false;
    // }
   
   
})

interactor_rectangle.mouseup = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    if ( typeof index_rectangle !== "string")
    {
        const current_rectangle = local_board.rectangles.get(index_rectangle);
        
        current_rectangle.c1 = local_board.view.
        create_server_coord(current_rectangle.canvas_corner_top_left); 
        current_rectangle.c2 = local_board.view.create_server_coord(current_rectangle.canvas_corner_bottom_right); 
        index_rectangle = "";

        //TODO: emit server
    }


    // const esc  = local_board.view.create_server_coord(e);
    // if (last_down === DOWN_TYPE.EMPTY) {
    //     socket.emit("area_move_corner", last_created_area_index, esc.x, esc.y, AREA_CORNER.TOP_RIGHT);
    //     is_creating_area = false;
    //     first_corner = null;
    // }
    // else if (last_down === DOWN_TYPE.AREA_SIDE){
    //     socket.emit("area_move_side", last_down_index, esc.x, esc.y, side_number);      
    //     side_number = null;
    //     is_moving_area = false;
    // }
    // else if (last_down === DOWN_TYPE.AREA_CORNER){
    //     socket.emit("area_move_corner", last_down_index, esc.x, esc.y, corner_number);  
    //     corner_number = null;
    //     is_moving_area = false;
    // }
    // else if ( last_down == DOWN_TYPE.AREA){
    //     const canvas_shift = CanvasVect.from_canvas_coords(down_coord, e);
    //     const shift = local_board.view.server_vect(canvas_shift);
    //     // socket.emit("translate_areas", [last_down_index], shift.x, shift.y);
    //     local_board.translate_area(canvas_shift.opposite(), last_down_index, vertices_contained, local_board.view);
    //     socket.emit("translate_elements",[["Area", last_down_index]], shift);
    //     is_moving_area = false;
    // }
})


