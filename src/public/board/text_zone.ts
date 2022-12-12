import { Coord, TextZone } from "gramoloss";
import katex from "katex";
import { interactor_loaded } from "../interactors/interactor_manager";
import renderMathInElement, { RenderOptions } from "../katex-auto-render/auto-render";
import { View } from "./camera";
import { CanvasVect } from "./vect";
import { CanvasCoord } from "./vertex";

export class ClientTextZone extends TextZone {
    private _canvas_pos: CanvasCoord;
    div: HTMLDivElement;

    constructor(pos: Coord, width: number, text: string, view: View){
        super(pos, width, text);
        this.div = null;
        this._canvas_pos = view.create_canvas_coord(pos);

        if ( text != "" ){
            this.div = document.createElement("div");
            this.reset_div_pos();
            document.body.appendChild(this.div);
            this.div.classList.add("text_zone");
            this.div.style.width = String(this.width);
            
            this.div.innerHTML = text;// katex.renderToString(text);
            
        }
    }

    get canvas_pos(): CanvasCoord{
        return this._canvas_pos;
    }

    update_text(new_text: string){
        new_text = new_text.replace(/(\r\n|\r|\n)/g, "<br>");
        this.text = new_text;
        /*
        new_text = new_text.replace (/(\${1,2})((?:\\.|[\s\S])*)\1/g, function (m, tag, src) {
            // m is the entire match
            // tag is '$' or '$$' 
            // src is the internal text
            console.log("group: ", src)
            return katex.renderToString(src);
          });
          */
          this.div.innerHTML = new_text;// katex.renderToString(text);
          renderMathInElement(this.div);
        this.reset_div_pos();
    }

    reset_div_pos(){
        if ( this.text != ""){
            this.div.style.top = String(this._canvas_pos.y) + "px";
            this.div.style.left = String(this._canvas_pos.x) + "px";
        }
    }

    is_nearby(canvas_pos: CanvasCoord): boolean{
        return (this._canvas_pos.x <= canvas_pos.x && canvas_pos.x <= this._canvas_pos.x + this.div.clientWidth) && (this._canvas_pos.y <= canvas_pos.y && canvas_pos.y <= this._canvas_pos.y + this.div.clientHeight);
    }

    update_after_camera_change(view: View){
        this._canvas_pos = view.create_canvas_coord(this.pos);
        this.reset_div_pos();
    }
}