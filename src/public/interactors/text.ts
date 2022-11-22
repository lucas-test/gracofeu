import { Graph } from "gramoloss";
import { ClientGraph } from "../board/graph";
import { ClientLink } from "../board/link";
import { CanvasCoord, ClientVertex } from "../board/vertex";
import { local_board } from "../setup";
import { socket } from "../socket";
import { DOWN_TYPE, Interactor } from "./interactor";
import { last_down, last_down_index } from "./interactor_manager";

export var interactor_text = new Interactor("text", "t", "text.svg", new Set([DOWN_TYPE.LINK, DOWN_TYPE.LINK_WEIGHT, DOWN_TYPE.VERTEX, DOWN_TYPE.VERTEX_WEIGHT]), 'default')

// --------------

let current_index = null;
let current_element_type = null;

const input = document.createElement("input");
input.classList.add("weight_input");
input.id = "weight_input";
input.type = "text";
document.body.appendChild(input);

// --------------

interactor_text.mousedown = ((canvas, ctx, g, e) => {
    validate_weight();

    if (last_down == DOWN_TYPE.LINK || last_down == DOWN_TYPE.LINK_WEIGHT) {
        const link = g.links.get(last_down_index);
        display_weight_input(last_down_index, link.cp_canvas_pos, DOWN_TYPE.LINK);
    }
    if (last_down == DOWN_TYPE.VERTEX || last_down == DOWN_TYPE.VERTEX_WEIGHT) {
        if ( g.vertices.has(last_down_index)){
            const vertex = g.vertices.get(last_down_index);
            display_weight_input(last_down_index, vertex.canvas_pos, DOWN_TYPE.VERTEX);
        }
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
    input.style.top = String(pos.y);
    input.style.left = String(pos.x - 20);
    window.setTimeout(() => input.focus(), 0); // without timeout does not focus
    input.onkeyup = (e) => {
        if (e.key == "Enter") {
            validate_weight();
        }
    }
}

function turn_off_weight_input() {
    input.value = "";
    input.style.display = "none";
    input.blur();
}

export function validate_weight() {
    if (current_index != null ) {
        if ( current_element_type == DOWN_TYPE.VERTEX && local_board.graph.vertices.has(current_index)){
            socket.emit("update_weight", "VERTEX", current_index, input.value);
        } else if ( current_element_type == DOWN_TYPE.LINK && local_board.graph.links.has(current_index)){
            socket.emit("update_weight", "LINK", current_index, input.value);
        }
    }
    current_index = null;
    current_element_type = null;
    turn_off_weight_input();
}