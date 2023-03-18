import { Coord, TextZone } from "gramoloss";
import katex from "katex";
import { interactor_loaded, mouse_pos, select_interactor } from "../interactors/interactor_manager";
import { interactor_text } from "../interactors/text";
import renderMathInElement, { RenderOptions } from "../katex-auto-render/auto-render";
import { load_param } from "../parametors/parametor_manager";
import { local_board } from "../setup";
import { socket } from "../socket";
import { BoardElementType } from "./board";
import { View } from "./camera";
import { CanvasVect } from "./vect";
import { CanvasCoord } from "./vertex";

export class ClientTextZone extends TextZone {
    canvas_pos: CanvasCoord;
    div: HTMLDivElement;
    last_mouse_pos: CanvasCoord;

    constructor(pos: Coord, width: number, text: string, view: View, index: number){
        super(pos, width, text);
        this.canvas_pos = view.create_canvas_coord(pos);
        this.last_mouse_pos = new CanvasCoord(0,0);

            this.div = document.createElement("div");
            this.reset_div_pos();
            document.body.appendChild(this.div);
            this.div.classList.add("text_zone");
            this.div.style.width = String(this.width) + "px";

            const content = document.createElement("div");
            content.classList.add("text_zone_content");
            content.innerHTML = text;
            this.div.appendChild(content);
            

            const sidebar = document.createElement("div");
            sidebar.classList.add("text_zone_sidebar");
            this.div.appendChild(sidebar);

            const text_zone = this;

            sidebar.onmousedown = (e: MouseEvent) => {
                this.last_mouse_pos = new CanvasCoord(e.pageX, e.pageY);
                function move_div(e: MouseEvent){
                    const new_mouse_pos = new CanvasCoord(e.pageX, e.pageY);
                    text_zone.width += new_mouse_pos.x - text_zone.last_mouse_pos.x;
                    text_zone.last_mouse_pos = new_mouse_pos;
                    text_zone.div.style.width = String(text_zone.width) + "px";
                }
                window.addEventListener("mousemove", move_div);
                function stop_event(){
                    local_board.emit_update_element( BoardElementType.TextZone, index, "width", text_zone.width);
                    window.removeEventListener("mouseup", stop_event);
                    window.removeEventListener("mousemove", move_div);
                }
                window.addEventListener("mouseup", stop_event);
                return;
            }

            content.onmousedown = (e: MouseEvent) => {
                this.last_mouse_pos = new CanvasCoord(e.pageX, e.pageY);
                if (interactor_loaded.name == "selection"){
                    function move_div(e: MouseEvent){
                        const new_mouse_pos = new CanvasCoord(e.pageX, e.pageY);
                        const cshift = CanvasVect.from_canvas_coords(text_zone.last_mouse_pos, new_mouse_pos);
                        const shift = local_board.view.server_vect(cshift);
                        local_board.emit_translate_elements([[BoardElementType.TextZone, index]], shift);
                        text_zone.last_mouse_pos = new_mouse_pos;
                    }
                    window.addEventListener("mousemove", move_div);
                    function stop_event(){
                        window.removeEventListener("mouseup", stop_event);
                        window.removeEventListener("mousemove", move_div);
                    }
                    window.addEventListener("mouseup", stop_event);
                } else if (interactor_loaded.name == "eraser"){
                    local_board.emit_delete_elements([[BoardElementType.TextZone, index]]);
                }
            }

            content.ondblclick = (e) => {
                const canvas = document.getElementById("main") as HTMLCanvasElement;
                const ctx = canvas.getContext("2d");
                select_interactor(interactor_text, canvas, ctx, local_board.graph, null);
                local_board.display_text_zone_input(index);
            }
    }

    translate(shift: CanvasVect, view: View) {
        this.canvas_pos.translate_by_canvas_vect(shift);
        this.pos = view.create_server_coord(this.canvas_pos);
        this.reset_div_pos();
    }


    update_text(new_text: string){
        new_text = new_text.replace(/(\r\n|\r|\n)/g, "<br>");
        this.text = new_text;
         for (const content of this.div.getElementsByClassName("text_zone_content")){
            content.innerHTML = new_text;// katex.renderToString(text);
            renderMathInElement(content as HTMLElement);
         }
        this.reset_div_pos();
    }

    reset_div_pos(){
            this.div.style.top = String(this.canvas_pos.y) + "px";
            this.div.style.left = String(this.canvas_pos.x) + "px";
    }

    is_nearby(canvas_pos: CanvasCoord): boolean{
        return (this.canvas_pos.x <= canvas_pos.x && canvas_pos.x <= this.canvas_pos.x + this.div.clientWidth) && (this.canvas_pos.y <= canvas_pos.y && canvas_pos.y <= this.canvas_pos.y + this.div.clientHeight);
    }

    update_after_camera_change(view: View){
        this.canvas_pos = view.create_canvas_coord(this.pos);
        this.reset_div_pos();
    }
}