import { View } from "./camera";
import { CanvasCoord, ServerCoord } from "./coord";

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

    // local attributes:
    is_selected: boolean;
    index_string: string;
    parameter_values: Map<string,ParameterValue>;

    constructor(pos: ServerCoord) {
        this.pos = new ServerCoord(pos.x, pos.y);
        this.is_selected = false;
        this.index_string = "";
        this.color = "black";
        this.parameter_values = new Map();
    }

    update_param(param_id: string, value: string){
        this.parameter_values.set(param_id, new ParameterValue(value));
    }

    save_pos() {
        this.pos.save_canvas_pos();
    }


    is_nearby(pos: CanvasCoord, r: number) {
        return this.pos.canvas_pos.dist2(pos) <= r;
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
