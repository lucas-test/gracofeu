import { view } from '../camera';
import { CanvasCoord } from '../local_graph';
import { socket } from '../socket';
import { Interactor, DOWN_TYPE } from './interactor'


export let color_interactor = new Interactor("color", "c", "color.svg");
let color_selected = "red";
const colors_available = new Array();
colors_available.push("red", "green", "blue");


color_interactor.trigger = (mouse_pos: CanvasCoord) => {
    const color_picker_div = document.createElement("div");
    color_picker_div.id = "color_picker";
    color_picker_div.style.top = String(mouse_pos.y - 10);
    color_picker_div.style.left = String(mouse_pos.x - 10);

    const color_picker_input = document.createElement("input");
    color_picker_input.classList.add("color_picker_input");
    color_picker_input.type = "color";
    color_picker_div.appendChild(color_picker_input);

    for (const color of colors_available) {
        const color_div = document.createElement("div");
        color_div.classList.add("color_choice");
        if (color == color_selected) {
            color_div.classList.add("selected");
        }

        color_div.style.backgroundColor = color;
        color_div.onclick = () => {
            color_selected = color;
            color_picker_div.style.opacity = "0";
            setInterval((() => color_picker_div.remove()), 200);
        }
        color_picker_div.appendChild(color_div);
    }


    color_picker_input.onchange = () => {
        color_selected = color_picker_input.value;
        colors_available.push(color_selected);
    }

    color_picker_div.onmouseleave = ((e) => {
        color_picker_div.style.opacity = "0";
        setInterval((() => color_picker_div.remove()), 200);
    });

    document.body.appendChild(color_picker_div);
}



color_interactor.mousedown = ((down_type, down_element_index, canvas, ctx, g, e) => {
    if (down_type == DOWN_TYPE.VERTEX) {
        const data_socket = new Array();
        data_socket.push({ type: "vertex", index: down_element_index, color: color_selected });
        socket.emit("update_colors", data_socket);
    }
})


color_interactor.mousemove = ((canvas, ctx, g, e) => {
    const elt = g.get_element_nearby(e);
    if (elt.type == DOWN_TYPE.VERTEX) {
        const data_socket = new Array();
        data_socket.push({ type: "vertex", index: elt.index, color: color_selected });
        socket.emit("update_colors", data_socket);
        return true;
    }
    return false;
})



color_interactor.mouseup = ((canvas, ctx, g, e) => {

})