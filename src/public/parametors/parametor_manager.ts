import { draw } from '../draw';
import { param_nb_edges, param_nb_vertices } from './some_parametors';
import { Parametor } from './parametor';
import { Graph } from '../local_graph';
import { Area } from '../area';



export let params_loaded = []
export let params_available = []


export function setup_parametors_available() {
    params_available.push(param_nb_edges, param_nb_vertices)
}




export function load_param(param: Parametor, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, a: Area) {
    const html_id =  param.id + "_area_" +( a==null?"null":a.id);
    const area_id = (a==null?null:a.id);

    // console.log("ID", id, "AREA_ID", area_id);

    let newDiv = document.createElement("div");
    newDiv.classList.add("param");
    newDiv.id = "param_" + html_id;


    let button = document.createElement('div');
    button.innerHTML = "-";
    button.classList.add("div_button");
    button.classList.add("remove_param_button");
    button.addEventListener('click', () => { remove_loaded_param(param.id, area_id); });
    newDiv.appendChild(button);

    let span_name = document.createElement('span');
    span_name.innerHTML = " " + (a==null?"":("("+ a.label + ") ")) + param.name + ": ";
    newDiv.appendChild(span_name);

    let span_result = document.createElement("span");
    span_result.id = "span_result_" + html_id;
    console.log("SPAN ID", span_result.id);
    span_result.innerHTML = "";
    span_result.classList.add("result_span");
    newDiv.appendChild(span_result);

    document.getElementById("params_loaded").appendChild(newDiv);
    params_loaded.push({parametor:param, html_id:html_id, area_id : area_id})
    update_params_loaded(g)
    requestAnimationFrame(function () { draw(canvas, ctx, g) })
}




export function update_params_loaded(g:Graph) {
    for (let param of params_loaded) {
        // console.log(param, param.parametor, param.area);
        if(param.area_id === null){
            var result = param.parametor.compute(g);
            document.getElementById("span_result_" + param.html_id).innerHTML = result;
        }
        else{
            if(g.areas.has(param.area_id)){
                const area = g.areas.get(param.area_id);
                var result = param.parametor.compute(area.get_subgraph(g));
                document.getElementById("span_result_" + param.html_id).innerHTML = result;
            }
            else{
                remove_loaded_param(param.html_id, param.area_id);
            }
        }
    }
}


function remove_loaded_param(param_id: string, area_id:string) {
    for (var i = 0; i < params_loaded.length; i++) {
        if (params_loaded[i].parametor.html_id == param_id && area_id == params_loaded[i].area_id) {

            const DOM = document.getElementById("param_" + params_loaded[i].html_id);
            
            if(DOM !== null){
                DOM.remove()
                params_loaded.splice(i, 1)
                return
            }
        }
    }
}

