import { CanvasCoord } from "../board/coord";
import { local_board } from "../setup";
import { socket } from "../socket";
import { DOWN_TYPE, Interactor } from "./interactor";
import { last_down, last_down_index } from "./interactor_manager";

export var interactor_text = new Interactor("text", "t", "text.svg", new Set([DOWN_TYPE.LINK, DOWN_TYPE.LINK_WEIGHT]), 'default')

// --------------

let current_index = null;

const input = document.createElement("input");
input.classList.add("weight_input");
input.id = "weight_input";
input.type = "text";
document.body.appendChild(input);

// --------------

interactor_text.mousedown = ((canvas, ctx, g, e) => {
    validate_weight();

    if (last_down == DOWN_TYPE.LINK || last_down == DOWN_TYPE.LINK_WEIGHT) {
        current_index = last_down_index;
        const link = g.links.get(last_down_index);
        display_weight_input(link.cp.canvas_pos);
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

// ---------- SPECIFIC FUNCTIONS

function display_weight_input(pos: CanvasCoord) {
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
}

function validate_weight() {
    if (current_index != null && local_board.graph.links.has(current_index)) {
        socket.emit("update_weight", current_index, input.value);
    }
    current_index = null;
    turn_off_weight_input();
}