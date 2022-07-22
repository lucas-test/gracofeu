import { Area } from "./area";
import { center_canvas_on_rectangle } from "./camera";
import { CanvasCoord } from "./coord";
import { COLOR_BACKGROUND, draw } from "../draw";
import { Graph } from "./local_graph";
import { Parametor } from "../parametors/parametor";
import { params_available, params_loaded, update_parametor } from "../parametors/parametor_manager";
import { socket } from "../socket";
import { local_board } from "../setup";



export function make_list_areas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph){
    const list_area_DOM = document.getElementById("area_list_container");
    if(list_area_DOM){
        list_area_DOM.innerHTML = "";
        for(const a of g.areas.values()){
            const span_area = get_title_span_for_area(a);
            span_area.addEventListener("click", (e)=>{
                center_canvas_on_rectangle(local_board.view, local_board.view.canvasCoord(a.top_left_corner()), local_board.view.canvasCoord(a.bot_right_corner()), canvas, g); // .canvas_pos est pas encore implémenté
                requestAnimationFrame(function () { 
                    draw(canvas, ctx, g) 
                });
                socket.emit("my_view", local_board.view.camera.x, local_board.view.camera.y, local_board.view.zoom);
            })
            list_area_DOM.appendChild(span_area);
        }
    }
}


export function init_parametor_div(param:Parametor, a:Area, g:Graph):HTMLElement{
    const html_id =  param.get_parametor_html_id(a);
    const area_id = (a==null?null:a.id);
    const param_to_load = {parametor:param, html_id:html_id, area_id : area_id};
    
    let div_parametor = document.getElementById("param_" + html_id);
        
    if( div_parametor === null)
    {
        // Div for the parametor
        div_parametor = document.createElement("div");
        div_parametor.classList.add("param", "inactive_parametor");
        div_parametor.id = "param_" + html_id;

        // Remove button
        let button = document.createElement('div');
        button.innerHTML = "-";
        button.classList.add("div_button");
        button.classList.add("remove_param_button");
        button.addEventListener('click', () => { remove_loaded_param(param.id, area_id); console.log("REMOVE", param, area_id) });
        div_parametor.appendChild(button);

        // Span for label
        let span_name = document.createElement('span');
        // if(a!== null){
        //     let span_area_name = a.get_span_for_area();
        //     div_parametor.appendChild(span_area_name);
        // }
        span_name.innerHTML = param.name + ": ";
        div_parametor.appendChild(span_name);

        // Span for the result
        let span_result = document.createElement("span");
        span_result.id = "span_result_" + html_id;
        span_result.innerHTML = "";
        span_result.classList.add("result_span");
        if(param.is_boolean){
            span_result.classList.add("inactive_boolean_result");
        }
        div_parametor.appendChild(span_result);
        if(!param.is_live){
            let svg_reload_parametor = document.createElement("img");
            svg_reload_parametor.id = "img_reload_" + html_id;
            svg_reload_parametor.src = "img/parametor/reload.svg";
            svg_reload_parametor.addEventListener('click', ()=>{update_parametor(g,param_to_load)});
            svg_reload_parametor.classList.add("reload_img");
            div_parametor.appendChild(svg_reload_parametor);
        }

        return div_parametor;
    }
    else{
        return null;
    }

    // Add parametor to document and list of loaded parametors
    // document.getElementById("params_loaded").appendChild(div_parametor);
    // params_loaded.push(param_to_load);
    // update_params_loaded(g, new Set(), true);
    // if(param.is_live){
    //     update_parametor(g, param_to_load);
    // }
    // requestAnimationFrame(function () { draw(canvas, ctx, g) })
}


export function get_title_span_for_area(a:Area):HTMLSpanElement{
    const span_area = document.createElement('span');
    span_area.classList.add("span_area_name_parametor");

    if(a!== null){
        span_area.textContent = a.label;
        span_area.style.background = a.multicolor.color;
        span_area.style.color = a.multicolor.contrast;
        span_area.style.borderColor = a.multicolor.contrast;
    }
    else{
        span_area.textContent = "Everything";
        span_area.style.background = COLOR_BACKGROUND;
        span_area.style.color = "#fff";
        span_area.style.borderColor = "#fff";
    }
    return span_area;
}

export function init_list_parametors_for_area(g:Graph, a:Area, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D){
    const a_id = (a==null?"null":a.id);
    let area_DOM = document.getElementById("area_"+ a_id);

    if(area_DOM === null)
    {
        area_DOM = document.createElement("div");
        area_DOM.id = "area_"+ a_id;
        area_DOM.classList.add("subgraph_parametors");
        
        let titleDOM = document.getElementById("title_area_"+ a_id);
        if(titleDOM === null){
            titleDOM = get_title_span_for_area(a);
            titleDOM.id = "title_area_"+ a_id;
            area_DOM.appendChild(titleDOM);

            if(a!== null){
                // Center on the area on click
                titleDOM.addEventListener("click",  (e)=>{
                    center_canvas_on_rectangle(local_board.view, local_board.view.canvasCoord(a.top_left_corner()), local_board.view.canvasCoord(a.bot_right_corner()), canvas, g); // .canvas_pos est pas encore implémenté
                    requestAnimationFrame(function () { 
                        draw(canvas, ctx, g) 
                    });
                });
            }
            else{
                // Center on the graph on click
                titleDOM.addEventListener("click",  (e)=>{
                    let top_left_corner = new CanvasCoord(-canvas.width/2, -canvas.height/2);
                    let bot_right_corner = new CanvasCoord(canvas.width/2, canvas.height/2);

                    if(g.vertices.size > 1){
                        const v = g.vertices.values().next().value;
                        let xMin = v.canvas_pos.x;
                        let yMin = v.canvas_pos.y;
                        let xMax = v.canvas_pos.x;
                        let yMax = v.canvas_pos.y;

                        for(const u of g.vertices.values()){
                            xMin = Math.min(xMin, u.canvas_pos.x);
                            yMin = Math.min(yMin, u.canvas_pos.y);
                            xMax = Math.max(xMax, u.canvas_pos.x);
                            yMax = Math.max(yMax, u.canvas_pos.y);
                        }

                        top_left_corner = new CanvasCoord(xMin, yMin);
                        bot_right_corner = new CanvasCoord(xMax, yMax);
                    }
                    else if(g.vertices.size === 1){
                        const v = g.vertices.values().next().value;
                        let xMin = v.canvas_pos.x - canvas.width/2;
                        let yMin = v.canvas_pos.y - canvas.height/2;
                        let xMax = v.canvas_pos.x + canvas.width/2;
                        let yMax = v.canvas_pos.y + canvas.height/2;
                        top_left_corner = new CanvasCoord(xMin, yMin);
                        bot_right_corner = new CanvasCoord(xMax, yMax);
                    }

                    center_canvas_on_rectangle(local_board.view, top_left_corner, bot_right_corner, canvas, g);
                    requestAnimationFrame(function () { 
                        draw(canvas, ctx, g) 
                    });
                });
            }
        }
        
        const param_containerDOM = document.createElement("div");
        param_containerDOM.classList.add("param_list_container");
        for(const param of params_available){
            const div_parametor = init_parametor_div(param, a, g);
            if(div_parametor !== null){
                param_containerDOM.appendChild(div_parametor);
            }
        }
        area_DOM.appendChild(param_containerDOM);

        const param_list = document.getElementById("subgraph_list");
        param_list.appendChild(area_DOM);
    }
}



export function remove_loaded_param(param_id: string, area_id:string) {
    for (var i = 0; i < params_loaded.length; i++) {
        if (params_loaded[i].parametor.id == param_id && area_id == params_loaded[i].area_id) {
            const DOM = document.getElementById("param_" + params_loaded[i].html_id);
            console.log("FOUND DOM", DOM);
            if(DOM !== null){
                DOM.classList.add("inactive_parametor");
            }
            params_loaded.splice(i, 1);
            return
        }
    }
}