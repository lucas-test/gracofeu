import { center_canvas_on_rectangle, view } from "./camera";
import { draw } from "./draw";
import { Graph } from "./local_graph";
import { socket } from "./socket";



export function make_list_areas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph){
    const list_area_DOM = document.getElementById("area_list_container");
    if(list_area_DOM){
        list_area_DOM.innerHTML = "";
        for(const a of g.areas.values()){
            const span_area = a.get_span_for_area();
            span_area.addEventListener("click", (e)=>{
                center_canvas_on_rectangle(view.canvasCoord(a.top_left_corner()), view.canvasCoord(a.bot_right_corner()), canvas, g); // .canvas_pos est pas encore implémenté
                requestAnimationFrame(function () { 
                    draw(canvas, ctx, g) 
                });
                socket.emit("my_view", view.camera.x, view.camera.y, view.zoom);
            })
            list_area_DOM.appendChild(span_area);
        }
    }
}