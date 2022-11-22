import { Coord, Vect, Vertex } from "gramoloss";
import katex from "katex";
import { COLOR_INNER_VERTEX_DEFAULT } from "../draw";
import { DOWN_TYPE } from "../interactors/interactor";
import { interactor_loaded } from "../interactors/interactor_manager";
import { display_weight_input, validate_weight } from "../interactors/text";
import { bezierValue, solutionQuadratic } from "../utils";
import { View } from "./camera";
import { CanvasVect } from "./vect";

export class ParameterValue {
    value: string;

    constructor(value: string){
        this.value = value;
    }
}

export class CanvasCoord extends Coord {
    constructor(x: number, y: number){
        super(Math.floor(x),Math.floor(y));
    }

    copy(): CanvasCoord {
        return new CanvasCoord(this.x, this.y);
    }

    subc(c: CanvasCoord): CanvasCoord {
        return new CanvasCoord(this.x - c.x,this.y - c.y);
    }

    addc(c: CanvasCoord): CanvasCoord {
        return new CanvasCoord(this.x + c.x,this.y + c.y);
    }
 

    translate_by_canvas_vect(shift: CanvasVect): void {
        this.x += shift.x;
        this.y += shift.y;
    }

    middle(c: CanvasCoord) {
        return new CanvasCoord((this.x + c.x) / 2, (this.y + c.y) / 2);
    }

    is_nearby(pos: CanvasCoord, rsquared: number) {
        return this.dist2(pos) <= rsquared;
    }

    // return boolean
    // true if the square of size 10 centered on this intersects the bezier Curve from c1 to c2 with control point cp
    is_nearby_beziers_1cp(c1: CanvasCoord, cp: CanvasCoord, c2: CanvasCoord): boolean {

        let xA = this.x - 5
        let yA = this.y - 5
        let xB = this.x + 5
        let yB = this.y + 5

        let minX = xA
        let minY = yA
        let maxX = xB
        let maxY = yB

        let x0 = c1.x;
        let y0 = c1.y;
        let x1 = cp.x;
        let y1 = cp.y;
        let x2 = c2.x;
        let y2 = c2.y;

        // case where one of the endvertices is already on the box
        if (c1.is_in_rect(new CanvasCoord(xA, yA), new CanvasCoord(xB, yB)) || c1.is_in_rect(new CanvasCoord(xA, yA), new CanvasCoord(xB, yB))) {
            return true
        } else {
            // we get the quadratic equation of the intersection of the bended edge and the sides of the box
            let aX = (x2 + x0 - 2 * x1);
            let bX = 2 * (x1 - x0);
            let cXmin = x0 - minX;
            let cXmax = x0 - maxX;

            let aY = (y2 + y0 - 2 * y1);
            let bY = 2 * (y1 - y0);
            let cYmin = y0 - minY;
            let cYmax = y0 - maxY;

            // the candidates for the intersections
            let tXmin = solutionQuadratic(aX, bX, cXmin);
            let tXmax = solutionQuadratic(aX, bX, cXmax);
            let tYmin = solutionQuadratic(aY, bY, cYmin);
            let tYmax = solutionQuadratic(aY, bY, cYmax);

            for (let t of tXmax.concat(tXmin)) { // we look for the candidates that are touching vertical sides
                if (t >= 0 && t <= 1) {
                    let y = bezierValue(t, y0, y1, y2);
                    if ((minY <= y && y <= maxY)) { // the candidate touches the box
                        return true;
                    }
                }
            }

            for (let t of tYmax.concat(tYmin)) {
                if (t >= 0 && t <= 1) {
                    let x = bezierValue(t, x0, x1, x2);
                    if ((minX <= x && x <= maxX)) {
                        return true;
                    }
                }
            }

        }
        return false;
    }
}







export class ClientVertex extends Vertex {
    canvas_pos: CanvasCoord;
    is_selected: boolean;
    index_string: string;
    parameter_values: Map<string,ParameterValue>;
    weight_div: HTMLDivElement = null; // set to null until a non empty weight is used

    constructor(x:number, y:number, weight: string, view: View) {
        super(x,y,weight);
        this.canvas_pos = view.create_canvas_coord(this.pos );
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

            this.weight_div.style.top = String(this.canvas_pos.y + 20 - this.weight_div.clientHeight/2);
            this.weight_div.style.left = String(this.canvas_pos.x- this.weight_div.clientWidth/2);
        }
    }

    // TODO use this method when creating a vertex in graph
    // TODO same with wheel
    init_weight_interactors(this_index: number) {
        // TODO check if null
        this.weight_div.onclick = (e) => {
            if( interactor_loaded.name == "text"){
                validate_weight();
                display_weight_input(this_index, new CanvasCoord(this.canvas_pos.x , this.canvas_pos.y+20),DOWN_TYPE.VERTEX);
            }
        }
    }

    update_param(param_id: string, value: string){
        this.parameter_values.set(param_id, new ParameterValue(value));
    }

    update_after_view_modification(view: View){
        this.canvas_pos = view.create_canvas_coord(this.pos);
    }


    is_nearby(pos: CanvasCoord, rsquared: number) {
        return this.canvas_pos.dist2(pos) <= rsquared;
    }

    translate_by_canvas_vect(shift: CanvasVect, view: View){
        this.canvas_pos.translate_by_canvas_vect(shift);
        this.pos.x += shift.x/view.zoom;
        this.pos.y += shift.y/view.zoom;
    }

    translate_by_server_vect(shift: Vect, view: View){
        const canvas_shift = view.create_canvas_vect(shift);
        this.canvas_pos.translate_by_canvas_vect(canvas_shift);
        this.pos.x += shift.x;
        this.pos.y += shift.y;
    }

    is_in_rect(c1: CanvasCoord, c2: CanvasCoord) {
        return this.canvas_pos.is_in_rect(c1,c2);
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
