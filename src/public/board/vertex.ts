import katex from "katex";
import { COLOR_INNER_VERTEX_DEFAULT } from "../draw";
import { DOWN_TYPE } from "../interactors/interactor";
import { interactor_loaded } from "../interactors/interactor_manager";
import { display_weight_input, validate_weight } from "../interactors/text";
import { View } from "./camera";
import { CanvasCoord, Coord, ServerCoord } from "./coord";

export class ParameterValue {
    value: string;

    constructor(value: string){
        this.value = value;
    }
}

export class LocalVertex {
    // server attributes:
    pos: ServerCoord;
    color: string;
    weight: string;

    // local attributes:
    is_selected: boolean;
    index_string: string;
    parameter_values: Map<string,ParameterValue>;
    weight_div: HTMLDivElement = null; // set to null until a non empty weight is used

    constructor(pos: ServerCoord, weight: string) {
        this.pos = new ServerCoord(pos.x, pos.y);
        this.weight = weight;
        this.is_selected = false;
        this.index_string = "";
        this.color = COLOR_INNER_VERTEX_DEFAULT;
        this.parameter_values = new Map();

        if ( weight != "" ){
            console.log("add_weight")
            this.weight_div = document.createElement("div");
            this.weight_div.classList.add("weight_link");
            document.body.appendChild(this.weight_div);
            this.weight_div.innerHTML = katex.renderToString(weight);

            this.weight_div.style.top = String(this.pos.canvas_pos.y + 20 - this.weight_div.clientHeight/2);
            this.weight_div.style.left = String(this.pos.canvas_pos.x- this.weight_div.clientWidth/2);
        }
    }

    // TODO use this method when creating a vertex in graph
    // TODO same with wheel
    init_weight_interactors(this_index: number) {
        // TODO check if null
        this.weight_div.onclick = (e) => {
            if( interactor_loaded.name == "text"){
                validate_weight();
                display_weight_input(this_index, new CanvasCoord(this.pos.canvas_pos.x , this.pos.canvas_pos.y+20),DOWN_TYPE.VERTEX);
            }
        }
    }

    update_param(param_id: string, value: string){
        this.parameter_values.set(param_id, new ParameterValue(value));
    }

    save_pos() {
        this.pos.save_canvas_pos();
    }


    is_nearby(pos: CanvasCoord, rsquared: number) {
        return this.pos.canvas_pos.dist2(pos) <= rsquared;
    }

    translate(shift: CanvasCoord, view: View){
        this.pos.translate(shift, view);
    }

    is_in_rect(c1: CanvasCoord, c2: CanvasCoord) {
        return this.pos.canvas_pos.is_in_rect(c1,c2);
    }

    get_tikz_coordinate(index: number) {
        return `v${index}`;
    }
    tikzify_coordinate(index: number) {
        return `\\coordinate (${this.get_tikz_coordinate(index)}) at (${Math.round(this.pos.x)/100}, ${Math.round(this.pos.y)/100});`;
    }

    tikzify_node(index: number) {
        // const c = "c" + COLORS.indexOf(this.color);
        // if (this.color == DEFAULT_COLOR) {
        //   c = "white";
        // }

        return `\\node[scale = \\scaleV, nodes={white}{}{}{}] at  (${this.get_tikz_coordinate(index)})  {};`;
    }

    tikzify_label() {
        // TODO
        let labelCode = "";
        // https://tex.stackexchange.com/questions/58878/tikz-set-node-label-position-more-precisely
        // shift={(1,0.3)} COMMENT 2

        // labelCode = "\\node[shift={(" + round(this.label.getExactLabelOffsetX() * 10) / 1000 + "," + -round(this.label.getExactLabelOffsetY() * 10) / 1000 + ")}, scale=\\scaleV] at  (v" + Vertices.indexOf(this) + ") {" + this.label.text + "};";

        return labelCode;
    }

}
