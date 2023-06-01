/*

INTERACTOR CONTROL POINT

Features :
- click on link: create a control point on the middle
- click and move on a control point: move it. With Control Key pressed: aligned on the mediatrice of the link
- right click on a control point: remove it

*/


import { Vect } from "gramoloss";
import { BoardElementType } from "../../board/board";
import { ClientGraph } from "../../board/graph";
import { CanvasVect } from "../../board/vect";
import { CanvasCoord } from "../../board/vertex";
import { DOWN_TYPE } from "../../interactors/interactor";
import { down_coord, key_states, last_down, last_down_index, mouse_buttons } from "../../interactors/interactor_manager";
import { local_board } from "../../setup";
import { ORIENTATION_INFO } from "../element_side_bar";
import { InteractorV2 } from "../interactor_side_bar";

export const control_point_interactorV2 = new InteractorV2("control_point", "Edit control points", "h", ORIENTATION_INFO.RIGHT, "img/interactors/control_point.svg", "default", new Set([DOWN_TYPE.LINK, DOWN_TYPE.CONTROL_POINT]));

let previous_shift: Vect = new Vect(0,0);
let previous_canvas_shift = new CanvasVect(0,0);

control_point_interactorV2.mousedown = (( canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    previous_shift = new Vect(0,0);
    previous_canvas_shift = new CanvasVect(0,0);
    switch (last_down) {
        case DOWN_TYPE.LINK:{
            const link = g.links.get(last_down_index);
            if (typeof link.cp == "string"){
                const v1 = g.vertices.get(link.start_vertex);
                const v2 = g.vertices.get(link.end_vertex);
                const new_cp = v1.pos.middle(v2.pos);
                local_board.emit_update_element( BoardElementType.Link, last_down_index, "cp", new_cp);
            }
        }
        case DOWN_TYPE.CONTROL_POINT: {
            if (mouse_buttons == 2){
                local_board.emit_update_element( BoardElementType.Link, last_down_index, "cp", "");
            }
        }
    }
})

control_point_interactorV2.mousemove = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    switch (last_down) {
        case DOWN_TYPE.CONTROL_POINT:{
            if ( g.links.has(last_down_index)){
                const link = g.links.get(last_down_index);
                if ( key_states.get("Control") ){
                    const v1 = g.vertices.get(link.start_vertex);
                    const v2 = g.vertices.get(link.end_vertex);

                    const middle = v1.pos.middle(v2.pos);
                    const vect = Vect.from_coords(v1.pos, v2.pos);
                    const orthogonal = new Vect(-vect.y, vect.x);
                    const e_coord = local_board.view.create_server_coord(e);
                    const projection = e_coord.orthogonal_projection(middle, orthogonal);
                    const down_coord_server = local_board.view.create_server_coord(down_coord);

                    const shift = Vect.from_coords(down_coord_server, projection);
                    local_board.emit_translate_elements([[BoardElementType.ControlPoint, last_down_index]], shift.sub(previous_shift));
                    previous_shift.set_from(shift);
                } else {
                    const shift = local_board.view.server_vect(CanvasVect.from_canvas_coords(down_coord,e));
                    local_board.emit_translate_elements([[BoardElementType.ControlPoint, last_down_index]], shift.sub(previous_shift));
                    previous_shift.set_from(shift);
                }
            }
            return false;
        }
    }
    return false;
})



