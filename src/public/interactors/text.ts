import { CanvasCoord } from "../board/coord";
import { local_board } from "../setup";
import { socket } from "../socket";
import { DOWN_TYPE, Interactor } from "./interactor";
import { last_down, last_down_index } from "./interactor_manager";

export var interactor_text = new Interactor("text", "t", "text.svg", new Set([DOWN_TYPE.LINK]), 'default')

interactor_text.mousedown = ((canvas, ctx, g, e) => {
    if (last_down == DOWN_TYPE.LINK) {
        remove_all_weight_inputs();
        const link = g.links.get(last_down_index);
        create_weight_input(last_down_index, link.cp.canvas_pos);
    }
})

interactor_text.mousemove = ((canvas, ctx, g, e) => {

    return false;
})

interactor_text.mouseup = ((canvas, ctx, g, e) => {

})

interactor_text.onleave = () => {
    remove_all_weight_inputs();
}

// ---------- SPECIFIC FUNCTIONS

function create_weight_input(link_index: number, pos: CanvasCoord) {
    const input = document.createElement("input");
    input.classList.add("weight_input");
    input.type = "text";
    document.body.appendChild(input);
    input.style.top = String(pos.y);
    input.style.left = String(pos.x - 20);
    window.setTimeout(() => input.focus(), 0); // without timeout does not focus
    input.onkeyup = (e) => {
        if (e.key == "Enter"){
            if( local_board.graph.links.has(link_index)){
                socket.emit("update_weight", link_index, input.value);
                input.remove();
            }
        }
    }
}

function remove_all_weight_inputs(){
    for (const input of document.getElementsByClassName("weight_input")){
        input.remove();
    }
}