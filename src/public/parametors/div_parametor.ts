import { Graph } from '../board/graph';
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

        // param_label_div.onclick = function () { load_param(param, canvas, ctx, g, null); params_available_turn_off_div(); }
        div.appendChild(param_div);
        param_div.appendChild(param_label_div);
    }
}

export function update_options_graphs(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph){

    // We first clear every options 
    const elements = document.getElementsByClassName("subgraph_option");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }

    // console.log("LISTE PARAM", params_available);

    for(const param of params_available){
        console.log("SETTING UP ", param.id)

        // We first remove the previous click event on the parametor div by cloning it
        let div_original = document.getElementById(`param_div_${param.id}`);
        const div = div_original.cloneNode(true);
        div_original.parentNode.replaceChild(div, div_original);

        // we add the click event
        div.addEventListener('click', (e)=> toggle_list_graph_option(param, canvas, ctx, g));


        if(g.areas.size == 0){
            console.log("NO AREA", div);
        }
        else{ // If we have areas, we add a list of the subgraphs

            // We check if the div was already created
            let newDiv = document.getElementById(`param_div_${param.id}_list_graph_container`);

            if( newDiv == null){
                // If not, we create it
                newDiv = document.createElement("div");
                div.appendChild(newDiv);
                newDiv.id = `param_div_${param.id}_list_graph_container`;
                newDiv.classList.add('param_div_list_graph_container');
            }

            // Div for global graph 
            let gDiv = document.createElement("div");
            gDiv.classList.add("subgraph_option");
            gDiv.textContent = "Everything";
            newDiv.appendChild(gDiv);
            gDiv.addEventListener('click', function () {   
                load_param(param, canvas, ctx, g, null); 
                params_available_turn_off_div();
            });

            // Div for each area
            for(const a of g.areas.values()){
                let aDiv = document.createElement("div");
                aDiv.classList.add("subgraph_option");
                aDiv.textContent = a.label;
                newDiv.appendChild(aDiv);
                aDiv.addEventListener('click', function () { 
                    load_param(param, canvas, ctx, g, a); 
                    params_available_turn_off_div();
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


function toggle_list_graph_option(param:Parametor, canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D, g:Graph){
    console.log("CLICKY CLICKY", param);


    // if there is no area, click on the parametor just computes it on the full graph
    if(g.areas.size == 0){
        load_param(param, canvas, ctx, g, null);
        params_available_turn_off_div(); 
    }
    else{

        // We get the container of the list
        const containerDOM = document.getElementById(`param_div_${param.id}_list_graph_container`);

        // We toggle its visibility
        console.log("AVANT", containerDOM.style.display)
        if(containerDOM.style.display != "block"){
            containerDOM.style.display = "block"
        }
        else{
            containerDOM.style.display = "none"
        }

        console.log("APRES", containerDOM.style.display)
    }
}