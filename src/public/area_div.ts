import { Area } from "./area";
import { view } from "./camera";
import { CanvasCoord } from "./coord";
import { draw } from "./draw";
import { Graph } from "./local_graph";

export function get_span_for_area(a:Area):HTMLSpanElement{
    if(a!== null){
        const span_area = document.createElement('span');
        span_area.classList.add("span_area_name_parametor");
        span_area.textContent = a.label;
        span_area.style.background = a.multicolor.color;
        span_area.style.color = a.multicolor.contrast;
        span_area.style.borderColor = a.multicolor.contrast;
        return span_area;
    }
    return null;
}



export function make_list_areas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph){
    const list_area_DOM = document.getElementById("area_list_container");
    if(list_area_DOM){
        list_area_DOM.innerHTML = "";
        for(const a of g.areas.values()){
            const span_area = get_span_for_area(a);
            span_area.addEventListener("click", (e)=>{
                center_canvas_on_rectangle(a.top_left_corner().canvas_pos, a.bot_right_corner().canvas_pos, canvas, g);
                requestAnimationFrame(function () { 
                    draw(canvas, ctx, g) 
                });
            })
            list_area_DOM.appendChild(span_area);
        }
    }
}


function center_canvas_on_rectangle(top_left:CanvasCoord, bot_right:CanvasCoord, canvas: HTMLCanvasElement, g:Graph){
    const w = bot_right.x - top_left.x;
    const h = bot_right.y - top_left.y;
    const shift_x = (canvas.width - w)/2 - top_left.x;
    const shift_y = (canvas.height - h)/2 - top_left.y;
    const ratio_w = canvas.width/w;
    const ratio_h = canvas.height/h;

    view.camera.x += shift_x;
    view.camera.y += shift_y;
    g.update_canvas_pos();

    const center = new CanvasCoord(canvas.width/2, canvas.height/2);
    view.apply_zoom_to_center(center, Math.min(ratio_h, ratio_w)*0.8);
    g.update_canvas_pos();
}