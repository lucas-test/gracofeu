
import { Coord } from '../../server/coord';
import { Vertex } from '../../server/vertex';
import { Edge } from '../../server/edge';
import { Graph } from '../../server/graph';
import { load_param, params_available, params_loaded } from './parametor_manager';

export function update_params_available_div(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    let div = document.getElementById("params_available")
    for (let param of params_available) {
        let newDiv = document.createElement("div");
        newDiv.classList.add("param")
        newDiv.innerHTML = param.name

        newDiv.onclick = function () { load_param(param, canvas, ctx, g); params_available_turn_off_div() }
        div.appendChild(newDiv)
    }
}



export function params_available_turn_off_div() {
    var div = document.getElementById("params_available")
    div.style.display = "none"
}

export function params_available_turn_on_div() {
    var div = document.getElementById("params_available")
    div.style.display = "block"
}




export function remove_loaded_param(param_name: string) {
    for (var i = 0; i < params_loaded.length; i++) {
        if (params_loaded[i].name == param_name) {
            params_loaded.splice(i, 1)
            document.getElementById("param_" + param_name).remove()
            return
        }
    }
}