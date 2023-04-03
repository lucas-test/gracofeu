

// INTERACTOR SELECTION

import { Vect } from "gramoloss";
import { BoardElementType } from "../../board/board";
import { ClientGraph } from "../../board/graph";
import { resize_corner, resize_side, translate_by_canvas_vect } from "../../board/resizable";
import { CanvasVect } from "../../board/vect";
import { CanvasCoord } from "../../board/vertex";
import { DOWN_TYPE, RESIZE_TYPE } from "../../interactors/interactor";
import { down_coord, down_meta_element, has_moved, key_states, last_down, last_down_index } from "../../interactors/interactor_manager";
import { local_board } from "../../setup";
import { socket } from "../../socket";
import { self_user, update_users_canvas_pos } from "../../user";
import { ORIENTATION_INFO } from "../element_side_bar";
import { InteractorV2 } from "../interactor_side_bar";

export const selectionV2 = new InteractorV2("selection", "Selection tool", "s", ORIENTATION_INFO.LEFT, "img/interactors/selection.svg", "default", new Set([DOWN_TYPE.VERTEX, DOWN_TYPE.LINK, DOWN_TYPE.STROKE, DOWN_TYPE.REPRESENTATION_ELEMENT, DOWN_TYPE.REPRESENTATION, DOWN_TYPE.RECTANGLE, DOWN_TYPE.AREA, DOWN_TYPE.RESIZE]))

let previous_shift: Vect = new Vect(0,0);
let previous_canvas_shift = new CanvasVect(0,0);
let vertex_center_shift = new CanvasVect(0,0);
let opposite_coord = 0;
let opposite_corner: CanvasCoord;
let vertices_contained = new Set<number>();

selectionV2.mousedown = (( canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    previous_shift = new Vect(0,0);
    previous_canvas_shift = new CanvasVect(0,0);
    if (last_down === DOWN_TYPE.EMPTY) {
        if (key_states.get("Control")) {
            local_board.view.is_rectangular_selecting = true;
            local_board.view.selection_corner_1 = e; // peut etre faut copier
            local_board.view.selection_corner_2 = e; // peut etre faut copier
        }
    }else if (last_down == DOWN_TYPE.VERTEX){
        if (g.vertices.has(last_down_index)){
            const v = g.vertices.get(last_down_index);
            vertex_center_shift = CanvasVect.from_canvas_coords(e, v.canvas_pos);
        }
    } else if (last_down === DOWN_TYPE.RESIZE){
        const element = down_meta_element.element;
        switch(down_meta_element.resize_type){
            case RESIZE_TYPE.BOTTOM:{
                opposite_coord = element.canvas_corner_top_left.y;
                break;
            }
            case RESIZE_TYPE.TOP:{
                opposite_coord = element.canvas_corner_bottom_left.y;
                break;
            }
            case RESIZE_TYPE.LEFT:{
                opposite_coord = element.canvas_corner_bottom_right.x;
                break;
            }
            case RESIZE_TYPE.RIGHT:{
                opposite_coord = element.canvas_corner_bottom_left.x;
                break;
            }
            case RESIZE_TYPE.TOP_RIGHT: {
                opposite_corner = element.canvas_corner_bottom_left.copy();
                break;
            }
            case RESIZE_TYPE.BOTTOM_LEFT: {
                opposite_corner = element.canvas_corner_top_right.copy();
                break;
            }
            case RESIZE_TYPE.BOTTOM_RIGHT: {
                opposite_corner = element.canvas_corner_top_left.copy();
                break;
            }
            case RESIZE_TYPE.TOP_LEFT: {
                opposite_corner = element.canvas_corner_bottom_right.copy();
                break;
            }
        }
    } else if ( last_down == DOWN_TYPE.REPRESENTATION){
        previous_canvas_shift = new CanvasVect(0,0);
    } else if ( last_down == DOWN_TYPE.RECTANGLE){
        previous_canvas_shift = new CanvasVect(0,0);
    } else if ( last_down == DOWN_TYPE.AREA){
        previous_canvas_shift = new CanvasVect(0,0);
        const area = local_board.areas.get(last_down_index);
        vertices_contained = new Set();
        for (const [vertex_index, vertex] of g.vertices.entries()){
            if ( area.is_containing(vertex)){
                vertices_contained.add(vertex_index);
            }
        }
    }
})

selectionV2.mousemove = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    switch (last_down) {
        case DOWN_TYPE.VERTEX:
            const v = g.vertices.get(last_down_index)
            let indices = new Array<[BoardElementType,number]>();
            
            if (g.vertices.get(last_down_index).is_selected) {
                const selected_vertices = g.get_selected_vertices();
                for( const index of selected_vertices){
                    indices.push([BoardElementType.Vertex, index]);
                }
                for (const [stroke_index, stroke] of local_board.strokes.entries()){
                    if (stroke.is_selected){
                        indices.push([BoardElementType.Stroke, stroke_index]);
                    }
                }
                e.translate_by_canvas_vect(vertex_center_shift);
                e = g.align_position(e, selected_vertices, canvas, local_board.view);
                e.translate_by_canvas_vect(vertex_center_shift.opposite());
            }
            else {
                e.translate_by_canvas_vect(vertex_center_shift);
                e = g.align_position(e, new Set([last_down_index]), canvas, local_board.view);
                e.translate_by_canvas_vect(vertex_center_shift.opposite());
                indices.push([BoardElementType.Vertex,last_down_index]);
            }
            
            const shift = local_board.view.server_vect(CanvasVect.from_canvas_coords(down_coord,e));
            local_board.emit_translate_elements(indices, shift.sub(previous_shift));
            previous_shift.set_from(shift);
            return true;
            break;

        case DOWN_TYPE.EMPTY:
            if (local_board.view.is_rectangular_selecting) {
                local_board.view.selection_corner_2 = e; // peut etre faut copier
            } else {
                const shift = CanvasVect.from_canvas_coords(down_coord,e);
                local_board.view.translate_camera(shift.sub(previous_canvas_shift));
                previous_canvas_shift.set_from(shift);
                local_board.update_after_camera_change();
                local_board.update_canvas_pos(local_board.view);
                update_users_canvas_pos(local_board.view);
                
                if(local_board.view.following !== null){
                    self_user.unfollow(local_board.view.following);
                }
                socket.emit("my_view", local_board.view.camera.x, local_board.view.camera.y, local_board.view.zoom);
            }
            return true;
            break;

        case DOWN_TYPE.CONTROL_POINT:{
            if ( g.links.has(last_down_index)){
                const shift = local_board.view.server_vect(CanvasVect.from_canvas_coords(down_coord,e));
                local_board.emit_translate_elements([[BoardElementType.ControlPoint, last_down_index]], shift.sub(previous_shift));
                previous_shift.set_from(shift);
                return true;
            }
            return false;
        }
        case DOWN_TYPE.STROKE:{
            if ( local_board.strokes.has(last_down_index)){
                const stroke = local_board.strokes.get(last_down_index);
                const shift = CanvasVect.from_canvas_coords(down_coord,e);
                const mini_shift = shift.sub(previous_canvas_shift);

                if (stroke.is_selected){
                    for (const vertex of local_board.graph.vertices.values()){
                        if (vertex.is_selected){
                            vertex.translate_by_canvas_vect(mini_shift, local_board.view);
                        }
                    }
                    for (const other_stroke of local_board.strokes.values()){
                        if (other_stroke.is_selected){
                            other_stroke.translate_by_canvas_vect(mini_shift, local_board.view);
                        }
                    }
                } else {
                    stroke.translate_by_canvas_vect(mini_shift, local_board.view);
                }
                
                previous_canvas_shift.set_from(shift);
                return true;
            }
        }
        case DOWN_TYPE.REPRESENTATION_ELEMENT:{
            if ( local_board.representations.has(last_down_index)){
                const rep = local_board.representations.get(last_down_index);
                const shift = CanvasVect.from_canvas_coords(down_coord,e);
                rep.translate_element_by_canvas_vect(down_meta_element.element_index, shift.sub(previous_canvas_shift), local_board.view);
                previous_canvas_shift.set_from(shift);
                return true;
            }
        }

        case DOWN_TYPE.RESIZE: {
            const element = down_meta_element.element;
            if (down_meta_element.resize_type == RESIZE_TYPE.LEFT || down_meta_element.resize_type == RESIZE_TYPE.RIGHT ||down_meta_element.resize_type == RESIZE_TYPE.TOP ||down_meta_element.resize_type == RESIZE_TYPE.BOTTOM){
                resize_side(element, e, opposite_coord, down_meta_element.resize_type, local_board.view)
            } else {
                resize_corner(element, e, opposite_corner, local_board.view);
            }
            return true;
        }
        case DOWN_TYPE.REPRESENTATION: {
            const shift = CanvasVect.from_canvas_coords(down_coord,e);
            const rep = down_meta_element.element;
            rep.translate_by_canvas_vect(shift.sub(previous_canvas_shift), local_board.view );
            translate_by_canvas_vect(rep, shift.sub(previous_canvas_shift), local_board.view);
            previous_canvas_shift.set_from(shift);
            return true;
        }
        case DOWN_TYPE.RECTANGLE: {
            const shift = CanvasVect.from_canvas_coords(down_coord,e);
            const rect = down_meta_element.element;
            rect.translate_by_canvas_vect(shift.sub(previous_canvas_shift), local_board.view);
            translate_by_canvas_vect(rect, shift.sub(previous_canvas_shift), local_board.view);
            previous_canvas_shift.set_from(shift);
            return true;
        }
        case DOWN_TYPE.AREA: {
            const shift = CanvasVect.from_canvas_coords(down_coord,e);
            local_board.translate_area(shift.sub(previous_canvas_shift), down_meta_element.index, vertices_contained);
            previous_canvas_shift.set_from(shift);
            return true;
        }
    }


    return false;
})

selectionV2.mouseup = ((canvas, ctx, g, e) => {
    if (last_down === DOWN_TYPE.VERTEX) {
        if (has_moved === false) {
            if (g.vertices.get(last_down_index).is_selected) {
                if (key_states.get("Control")) { 
                    g.vertices.get(last_down_index).is_selected = false;
                }
            }
            else {
                if (key_states.get("Control")) {
                    g.vertices.get(last_down_index).is_selected = true;
                }
                else {
                    local_board.clear_all_selections();
                    g.vertices.get(last_down_index).is_selected = true;
                }
            }
        }
        else {
            const vertex_moved = g.vertices.get(last_down_index);
            for( const [index,v] of g.vertices.entries()){
                if( index != last_down_index && vertex_moved.is_nearby(v.canvas_pos, 100)){
                    local_board.emit_vertices_merge(index, last_down_index);
                    break;
                }
            }
        }

    } else if (last_down === DOWN_TYPE.LINK) {
        if (has_moved === false) {
            if (g.links.get(last_down_index).is_selected) {
                if (key_states.get("Control")) { 
                    g.links.get(last_down_index).is_selected = false;
                }
            }
            else {
                if (key_states.get("Control")) { 
                    g.links.get(last_down_index).is_selected = true;
                }
                else {
                    local_board.clear_all_selections();
                    g.links.get(last_down_index).is_selected = true;
                }
            }
        }

    }
    else if (last_down === DOWN_TYPE.STROKE)
    {
        if (has_moved === false) {
            if (local_board.strokes.get(last_down_index).is_selected) {
                if (key_states.get("Control")) { 
                    local_board.strokes.get(last_down_index).is_selected = false;
                }
            }
            else {
                if (key_states.get("Control")) { 
                    local_board.strokes.get(last_down_index).is_selected = true;
                }
                else {
                    local_board.clear_all_selections();
                    local_board.strokes.get(last_down_index).is_selected = true;
                }
            }
        } else {
            let indices = new Array<[BoardElementType,number]>();
            let elements_to_translate = new Array();
            
            if (local_board.strokes.get(last_down_index).is_selected) {
                for (const [vertex_index, vertex] of local_board.graph.vertices.entries()){
                    if (vertex.is_selected){
                        indices.push([BoardElementType.Vertex, vertex_index]);
                        elements_to_translate.push(vertex);
                    }
                }
                for (const [stroke_index, stroke] of local_board.strokes.entries()){
                    if (stroke.is_selected){
                        indices.push([BoardElementType.Stroke, stroke_index]);
                        elements_to_translate.push(stroke);
                    }
                }
            }
            else {
                indices.push([BoardElementType.Stroke,last_down_index]);
                const stroke = local_board.strokes.get(last_down_index);
                elements_to_translate.push(stroke);
            }
            
            const canvas_shift = CanvasVect.from_canvas_coords(down_coord, e);
            const shift = local_board.view.server_vect(canvas_shift);
            for (const element of elements_to_translate){
                element.translate_by_canvas_vect(canvas_shift.opposite(), local_board.view);
            }
            local_board.emit_translate_elements( indices, shift);
        }
    }
    else if (last_down === DOWN_TYPE.EMPTY) {
        if (local_board.view.is_rectangular_selecting) {
            local_board.view.is_rectangular_selecting = false;
            local_board.select_elements_in_rect(local_board.view.selection_corner_1, local_board.view.selection_corner_2);
        } else {
            local_board.clear_all_selections();
        }

    } else if (last_down == DOWN_TYPE.REPRESENTATION_ELEMENT){
        if ( local_board.representations.has(last_down_index)){
            const rep = local_board.representations.get(last_down_index);
            rep.onmouseup(local_board.view);
        }
    } else if (last_down == DOWN_TYPE.AREA){
        const canvas_shift = CanvasVect.from_canvas_coords(down_coord, e);
        const shift = local_board.view.server_vect(canvas_shift);
        local_board.translate_area(canvas_shift.opposite(), last_down_index, vertices_contained);
        local_board.emit_translate_elements([[BoardElementType.Area, last_down_index]], shift);
    } else if (last_down == DOWN_TYPE.RESIZE){
        const esc  = local_board.view.create_server_coord(e);
        local_board.emit_resize_element(down_meta_element.element_type, down_meta_element.index, esc, down_meta_element.resize_type);
    }
})


