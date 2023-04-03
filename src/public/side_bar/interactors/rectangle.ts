import { Coord } from "gramoloss";
import { ClientGraph } from "../../board/graph";
import { ClientRectangle } from "../../board/rectangle";
import { CanvasCoord } from "../../board/vertex";
import { DOWN_TYPE } from "../../interactors/interactor";
import { last_down } from "../../interactors/interactor_manager";
import { local_board } from "../../setup";
import { ORIENTATION_INFO } from "../element_side_bar";
import { InteractorV2 } from "../interactor_side_bar";


export const rectangle_interactorV2 = new InteractorV2("rectangle", "Draw rectangle", "r", ORIENTATION_INFO.LEFT, "img/interactors/rectangle.svg", "default", new Set([]));

let first_corner : Coord;
let opposite_corner = new CanvasCoord(0,0);

let index_rectangle : number | string = "";


rectangle_interactorV2.mousedown = (( canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    if (last_down === DOWN_TYPE.EMPTY) {
        first_corner = local_board.view.create_server_coord(e);
        opposite_corner = e.copy();
        index_rectangle = local_board.get_next_available_index_rectangle();
        const client_rectangle = new ClientRectangle(first_corner, first_corner, local_board.view);
        local_board.rectangles.set(index_rectangle, client_rectangle);
    } 
})

rectangle_interactorV2.mousemove = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    if ( typeof index_rectangle !== "string")
    {
        local_board.rectangles.get(index_rectangle).resize_corner_area(local_board.view.create_canvas_coord(first_corner), e, local_board.view);
        return true;   
    }
    return false;
})

rectangle_interactorV2.mouseup = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    if ( typeof index_rectangle !== "string")
    {
        const current_rectangle = local_board.rectangles.get(index_rectangle);
        
        current_rectangle.c1 = local_board.view.create_server_coord(current_rectangle.canvas_corner_top_left); 
        current_rectangle.c2 = local_board.view.create_server_coord(current_rectangle.canvas_corner_bottom_right); 
        index_rectangle = "";

        //TODO: emit server
    }
})


