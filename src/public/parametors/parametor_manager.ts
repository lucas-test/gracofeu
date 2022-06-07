import { Coord } from '../../server/coord';
import { Vertex } from '../../server/vertex';
import { Edge } from '../../server/edge';
import { Graph } from '../../server/graph';

import { draw } from '../draw';
import { param_nb_edges, param_nb_vertices } from './some_parametors';
import { Parametor } from './parametor';



export let params_loaded = []
export let params_available = []


export function setup_parametors_available() {
    params_available.push(param_nb_edges, param_nb_vertices)
}




export function load_param(param: Parametor, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    let newDiv = document.createElement("div");
    newDiv.classList.add("param");
    newDiv.id = "param_" + param.name;


    let button = document.createElement('button');
    button.innerHTML = "-";
    button.addEventListener('click', () => { remove_loaded_param(param.name); });
    newDiv.appendChild(button);

    let span_name = document.createElement('span');
    span_name.innerHTML = " " + param.name + " : ";
    newDiv.appendChild(span_name);

    let span_result = document.createElement("span");
    span_result.id = "span_result_" + param.name;
    span_result.innerHTML = "";
    newDiv.appendChild(span_result);

    document.getElementById("params_loaded").appendChild(newDiv);
    params_loaded.push(param)
    update_params_loaded(g)
    requestAnimationFrame(function () { draw(canvas, ctx, g) })
}




export function update_params_loaded(g: Graph) {
    for (let param of params_loaded) {
        var result = param.compute(g)
        document.getElementById("span_result_" + param.name).innerHTML = result
    }
}


function remove_loaded_param(param_name: string) {
    for (var i = 0; i < params_loaded.length; i++) {
        if (params_loaded[i].name == param_name) {
            params_loaded.splice(i, 1)
            document.getElementById("param_" + param_name).remove()
            return
        }
    }
}

