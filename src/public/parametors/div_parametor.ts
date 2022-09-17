import { Graph } from '../board/graph';
import { Parametor } from './parametor';
import { load_param, params_available, params_loaded } from './parametor_manager';

export function update_params_available_div(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    const div = document.getElementById("params_available_content");

    const search_input = document.createElement("input");
    search_input.classList.add("search_filter");
    search_input.type = "text";
    search_input.id = "param_search_input";
    search_input.onkeyup = handle_search_onkeyup;
    search_input.placeholder = "Search for names..";
    div.appendChild(search_input);

    for (let param of params_available) {
        const param_div = document.createElement("div");
        param_div.id = `param_div_${param.id}`;
        const param_label_div = document.createElement("div");
        param_label_div.classList.add("param")
        param_label_div.id = `param_div_label_${param.id}`;
        param_label_div.innerHTML = param.name

        // param_label_div.onclick = function () { load_param(param, canvas, ctx, g, null); params_available_turn_off_div(); }
        div.appendChild(param_div);
        param_div.appendChild(param_label_div);
    }
}

function handle_search_onkeyup() {
    const input = <HTMLInputElement>document.getElementById('param_search_input');
    const filter = input.value.toUpperCase();
    const div_content = document.getElementById("params_available_content");
    const param_list = <HTMLCollectionOf<HTMLDivElement>>div_content.getElementsByClassName('param');

    for (let i = 0; i < param_list.length; i++) {
        const txtValue = param_list[i].innerHTML;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            param_list[i].style.display = "";
        } else {
            param_list[i].style.display = "none";
        }
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
        // console.log("SETTING UP ", param.id)

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
    // console.log("CLICKY CLICKY", param);


    // if there is no area, click on the parametor just computes it on the full graph
    if(g.areas.size == 0){
        load_param(param, canvas, ctx, g, null);
        params_available_turn_off_div(); 
    }
    else{

        // We get the container of the list
        const containerDOM = document.getElementById(`param_div_${param.id}_list_graph_container`);

        // We toggle its visibility
        // console.log("AVANT", containerDOM.style.display)
        if(containerDOM.style.display != "block"){
            containerDOM.style.display = "block"
        }
        else{
            containerDOM.style.display = "none"
        }

        // console.log("APRES", containerDOM.style.display)
    }
}