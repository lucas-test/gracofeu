import { Graph, TextZone } from "gramoloss";
import { BoardElementType } from "../board/board";
import { ClientGraph } from "../board/graph";
import { ClientLink } from "../board/link";
import { CanvasCoord, ClientVertex } from "../board/vertex";
import { local_board } from "../setup";
import { socket } from "../socket";
import { DOWN_TYPE, Interactor } from "./interactor";
import { last_down, last_down_index } from "./interactor_manager";

export var interactor_text = new Interactor("text", "t", "text.svg", new Set([DOWN_TYPE.LINK, DOWN_TYPE.LINK_WEIGHT, DOWN_TYPE.VERTEX, DOWN_TYPE.VERTEX_WEIGHT, DOWN_TYPE.TEXT_ZONE]), 'default')

// --------------

let current_index = null;
let current_element_type = null;

const input = document.createElement("input");
input.classList.add("weight_input");
input.id = "weight_input";
input.type = "text";
document.body.appendChild(input);

const text_zone_input = document.createElement("textarea");
const text_zone_input_pre = document.createElement("pre");
const text_zone_input_code = document.createElement("code");
text_zone_input_pre.appendChild(text_zone_input_code);
text_zone_input_code.appendChild(text_zone_input);

text_zone_input.id = "text_zone_input";
text_zone_input.style.display = "none";
document.body.appendChild(text_zone_input_pre);

// --------------

interactor_text.mousedown = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    validate_weight();

    if (last_down == DOWN_TYPE.LINK || last_down == DOWN_TYPE.LINK_WEIGHT) {
        const link = g.links.get(last_down_index);
        let posu = g.vertices.get(link.start_vertex).canvas_pos;
        let posv = g.vertices.get(link.end_vertex).canvas_pos;
        let pos = posu.middle(posv);
        if ( typeof link.cp_canvas_pos != "string"){
            pos = link.cp_canvas_pos;
        } 
        display_weight_input(last_down_index, pos, DOWN_TYPE.LINK);
    }
    if (last_down == DOWN_TYPE.VERTEX || last_down == DOWN_TYPE.VERTEX_WEIGHT) {
        if ( g.vertices.has(last_down_index)){
            const vertex = g.vertices.get(last_down_index);
            display_weight_input(last_down_index, vertex.canvas_pos, DOWN_TYPE.VERTEX);
        }
    }
    if ( last_down == DOWN_TYPE.EMPTY){
        if (text_zone_input.style.display == "none"){
            const coord = local_board.view.create_server_coord(e);
            local_board.emit_add_element(new TextZone(coord, 100, ""),(response: number) => { } );
            // const new_index = local_board.create_text_zone(e);
            // local_board.display_text_zone_input(new_index);
        }else {
            text_zone_input.value = "";
            text_zone_input.style.display = "none";
            text_zone_input.blur();
        }
    }
    if ( last_down == DOWN_TYPE.TEXT_ZONE){
        local_board.display_text_zone_input(last_down_index);
    }
})

interactor_text.mousemove = ((canvas, ctx, g, e) => {
    return false;
})

interactor_text.mouseup = ((canvas, ctx, g, e) => {
})

interactor_text.onleave = () => {
    current_index = null;
    turn_off_weight_input();
}

interactor_text.trigger = (mouse_pos, g: ClientGraph) => {
    
}

// ---------- SPECIFIC FUNCTIONS

export function display_weight_input(index: number, pos: CanvasCoord, element_type: DOWN_TYPE) {
    current_index = index;
    current_element_type = element_type;
    input.style.display = "block";
    input.style.top = String(pos.y) + "px";
    input.style.left = String(pos.x - 20) + "px";
    window.setTimeout(() => input.focus(), 0); // without timeout does not focus
    input.onkeyup = (e) => {
        if (e.key == "Enter") {
            validate_weight();
        }
    }
}

function turn_off_weight_input() {
    console.log("turn off weight input");
    input.value = "";
    input.style.display = "none";
    input.blur();
}

export function validate_weight() {
    console.log("validate_weight");
    if (current_index != null ) {
        if ( current_element_type == DOWN_TYPE.VERTEX && local_board.graph.vertices.has(current_index)){
            local_board.emit_update_element( BoardElementType.Vertex, current_index, "weight", input.value);
        } else if ( current_element_type == DOWN_TYPE.LINK && local_board.graph.links.has(current_index)){
            local_board.emit_update_element( BoardElementType.Link, current_index, "weight", input.value);
        }
    }
    current_index = null;
    current_element_type = null;
    turn_off_weight_input();
}