import { draw } from '../draw';
import { param_average_degree, param_has_proper_coloring, param_is_connected, param_max_degree, param_min_degree, param_nb_edges, param_nb_vertices, param_number_colors, param_number_geo } from './some_parametors';
import { Parametor, SENSIBILITY } from './parametor';
import { Graph } from '../board/graph';
import { Area } from '../board/area';
import { get_title_span_for_area, remove_loaded_param } from '../board/area_div';



export let params_loaded = []
export let params_available = []


export function setup_parametors_available() {
    params_available.push(param_nb_edges, param_nb_vertices, param_is_connected, param_number_colors, param_number_geo, param_min_degree, param_max_degree, param_average_degree, param_has_proper_coloring);
}




export function load_param(param: Parametor, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, a: Area) {
    const html_id =  param.id + "_area_" +( a==null?"null":a.id);
    const area_id = (a==null?null:a.id);
    const param_to_load = {parametor:param, html_id:html_id, area_id : area_id};

    let div_parametor = document.getElementById("param_" + html_id);
    if(div_parametor !== null){
        params_loaded.push(param_to_load);
        div_parametor.classList.remove("inactive_parametor");

        if(param.is_live){
            update_parametor(g, param_to_load);
            requestAnimationFrame(function () { draw(canvas, ctx, g) })
        }
    }




    // // Some IDs for the html
    // const html_id =  param.id + "_area_" +( a==null?"null":a.id);
    // const area_id = (a==null?null:a.id);
    // const param_to_load = {parametor:param, html_id:html_id, area_id : area_id};

    // // Div for the parametor
    // let newDiv = document.createElement("div");
    // newDiv.classList.add("param");
    // newDiv.id = "param_" + html_id;

    // // Remove button
    // let button = document.createElement('div');
    // button.innerHTML = "-";
    // button.classList.add("div_button");
    // button.classList.add("remove_param_button");
    // button.addEventListener('click', () => { remove_loaded_param(param.id, area_id); });
    // newDiv.appendChild(button);

    // // Span for label
    // let span_name = document.createElement('span');
    // if(a!== null){
    //     let span_area_name = get_title_span_for_area(a);
    //     newDiv.appendChild(span_area_name);
    // }
    // span_name.innerHTML = param.name + ": ";
    // newDiv.appendChild(span_name);

    // // Span for the result
    // let span_result = document.createElement("span");
    // span_result.id = "span_result_" + html_id;
    // span_result.innerHTML = "";
    // span_result.classList.add("result_span");
    // if(param.is_boolean){
    //     span_result.classList.add("inactive_boolean_result");
    // }
    // newDiv.appendChild(span_result);
    // if(!param.is_live){
    //     let svg_reload_parametor = document.createElement("img");
    //     svg_reload_parametor.id = "img_reload_" + html_id;
    //     svg_reload_parametor.src = "img/parametor/reload.svg";
    //     svg_reload_parametor.addEventListener('click', ()=>{update_parametor(g,param_to_load)});
    //     svg_reload_parametor.classList.add("reload_img");
    //     newDiv.appendChild(svg_reload_parametor);
    // }

    // // Add parametor to document and list of loaded parametors
    // document.getElementById("params_loaded").appendChild(newDiv);
    // params_loaded.push(param_to_load);
    // // update_params_loaded(g, new Set(), true);
    // if(param.is_live){
    //     update_parametor(g, param_to_load);
    // }
    // requestAnimationFrame(function () { draw(canvas, ctx, g) })
}




export function update_params_loaded(g:Graph, sensibilities:Set<SENSIBILITY>, force_compute?:boolean) {
    if(force_compute === undefined){
        force_compute = false;
    }

    for (let param of params_loaded) {
        if(!param.parametor.is_live && param.parametor.is_sensible(sensibilities)){
            invalid_parametor(param);
        }
        if((force_compute || param.parametor.is_live) && param.parametor.is_sensible(sensibilities)){
            update_parametor(g, param);
        }
        
    }
}

function invalid_parametor(param){
    const result_span = document.getElementById("span_result_" + param.html_id);
    update_result_span("", param.parametor, result_span);
}


export function update_parametor(g:Graph, param){
    const result_span = document.getElementById("span_result_" + param.html_id);
    if(param.area_id === null){
        var result = param.parametor.compute(g);
        update_result_span(result, param.parametor, result_span);
    }
    else{
        if(g.areas.has(param.area_id)){
            var result = param.parametor.compute(g.get_subgraph_from_area(param.area_id));
            update_result_span(result, param.parametor, result_span);
        }
        else{
            remove_loaded_param(param.html_id, param.area_id);
        }
    }
}


function update_result_span(result:string, param, result_span:HTMLElement){
    if(param.is_boolean){
        if(result == "true"){
            result_span.classList.remove("inactive_boolean_result", "false_boolean_result");
            result_span.classList.add("true_boolean_result");
        }
        else if(result == "false") {
            result_span.classList.remove("inactive_boolean_result", "true_boolean_result");
            result_span.classList.add("false_boolean_result");
        }
        else{
            result_span.classList.remove("false_boolean_result", "true_boolean_result");
            result_span.classList.add("inactive_boolean_result");
        }
    }
    else{
        result_span.textContent = result;
    }
}

// function remove_loaded_param(param_id: string, area_id:string) {
    
//     for (var i = 0; i < params_loaded.length; i++) {
//         if (params_loaded[i].parametor.id == param_id && area_id == params_loaded[i].area_id) {
//             const DOM = document.getElementById("param_" + params_loaded[i].html_id);

//             if(DOM !== null){
//                 DOM.remove()
//                 params_loaded.splice(i, 1)
//                 return
//             }
//         }
//     }
// }




