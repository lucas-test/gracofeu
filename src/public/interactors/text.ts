import { CanvasCoord } from "../board/coord";
import { local_board } from "../setup";
import { socket } from "../socket";
import { DOWN_TYPE, Interactor } from "./interactor";
import { last_down, last_down_index } from "./interactor_manager";

export var interactor_text = new Interactor("text", "t", "text.svg", new Set([DOWN_TYPE.LINK]), 'default')

interactor_text.mousedown = ((canvas, ctx, g, e) => {
    if (last_down == DOWN_TYPE.LINK) {
        create_weight_input(e);
    }
})

interactor_text.mousemove = ((canvas, ctx, g, e) => {

    return false;
})

interactor_text.mouseup = ((canvas, ctx, g, e) => {

})

// ---------- SPECIFIC FUNCTIONS

function create_weight_input(pos: CanvasCoord) {
    const input = document.createElement("input");
    input.classList.add("weight_input");
    input.type = "text";
    document.body.appendChild(input);
    input.style.top = String(pos.y - 8);
    input.style.left = String(pos.x - 8);
    window.setTimeout(() => input.focus(), 0); // without timeout does not focus
    input.onmouseleave = (e) => {
        input.remove();
    }
    input.onkeyup = (e) => {
        if (e.key == "Enter"){
            if( local_board.graph.links.has(last_down_index)){
                socket.emit("update_weight", last_down_index, input.value);
                input.remove();
            }
        }
    }
}