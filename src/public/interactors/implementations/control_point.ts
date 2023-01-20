/*

INTERACTOR CONTROL POINT

Features :
- click on link: create a control point on the middle
- click and move on a control point: move it. With Control Key pressed: aligned on the mediatrice of the link
- right click on a control point: remove it

*/


import { Vect } from "gramoloss";
import { ClientGraph } from "../../board/graph";
import { CanvasVect } from "../../board/vect";
import { CanvasCoord } from "../../board/vertex";
import { local_board } from "../../setup";
import { socket } from "../../socket";
import { DOWN_TYPE, Interactor } from "../interactor";
import { down_coord, key_states, last_down, last_down_index, mouse_buttons } from "../interactor_manager";

export const interactor_control_point = new Interactor("control_point", "h", "control_point.svg", new Set([DOWN_TYPE.LINK, DOWN_TYPE.CONTROL_POINT]), 'default')

let previous_shift: Vect = new Vect(0,0);
let previous_canvas_shift = new CanvasVect(0,0);

interactor_control_point.mousedown = (( canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    previous_shift = new Vect(0,0);
    previous_canvas_shift = new CanvasVect(0,0);
    switch (last_down) {
        case DOWN_TYPE.LINK:{
            const link = g.links.get(last_down_index);
            if (typeof link.cp == "string"){
                const v1 = g.vertices.get(link.start_vertex);
                const v2 = g.vertices.get(link.end_vertex);
                const new_cp = v1.pos.middle(v2.pos);
                socket.emit("update_element", "Link", last_down_index, "cp", new_cp);
            }
        }
        case DOWN_TYPE.CONTROL_POINT: {
            if (mouse_buttons == 2){
                socket.emit("update_element", "Link", last_down_index, "cp", "");
            }
        }
    }
})

interactor_control_point.mousemove = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
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
                    socket.emit("translate_elements", [["ControlPoint", last_down_index]], shift.sub(previous_shift));
                    previous_shift.set_from(shift);
                } else {
                    const shift = local_board.view.server_vect(CanvasVect.from_canvas_coords(down_coord,e));
                    socket.emit("translate_elements", [["ControlPoint", last_down_index]], shift.sub(previous_shift));
                    previous_shift.set_from(shift);
                }
            }
            return false;
        }
    }
    return false;
})

interactor_control_point.mouseup = ((canvas, ctx, g, e) => {
    
})


