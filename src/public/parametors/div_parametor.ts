import { Graph } from '../local_graph';
import { Parametor } from './parametor';
import { load_param, params_available, params_loaded } from './parametor_manager';

export function update_params_available_div(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    let div = document.getElementById("params_available")
    for (let param of params_available) {
        let param_div = document.createElement("div");
        // param_div.classList.add("param")
        param_div.id = `param_div_${param.id}`;
        let param_label_div = document.createElement("div");
        param_label_div.classList.add("param")
        param_label_div.id = `param_div_label_${param.id}`;
        param_label_div.innerHTML = param.name

        param_label_div.onclick = function () { load_param(param, canvas, ctx, g, null); params_available_turn_off_div() }
        div.appendChild(param_div);
        param_div.appendChild(param_label_div);
    }
}

export function update_options_graphs(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph){

    const elements = document.getElementsByClassName("subgraph_option");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }

    for(const param of params_available){
        let div = document.getElementById(`param_div_${param.id}`);

        if(g.areas.size == 0){
            // div.addEventListener('click', function () { load_param(param, canvas, ctx, g, g); });
        }
        else{
            let newDiv = document.createElement("div");
            div.appendChild(newDiv);
            let gDiv = document.createElement("div");
            gDiv.classList.add("subgraph_option");
            gDiv.textContent = "All";
            newDiv.appendChild(gDiv);
            gDiv.addEventListener('click', function () { load_param(param, canvas, ctx, g, null); });

            for(const a of g.areas.values()){
                let aDiv = document.createElement("div");
                aDiv.classList.add("subgraph_option");
                aDiv.textContent = a.label;
                newDiv.appendChild(aDiv);
                aDiv.addEventListener('click', function () { load_param(param, canvas, ctx, g, a); 
                console.log(param, a.get_subgraph(g));
                });
            }
        }
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



