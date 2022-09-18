import katex from "katex";
import { interactor_loaded } from "../interactors/interactor_manager";
import { display_weight_input, validate_weight } from "../interactors/text";
import { local_board } from "../setup";
import { socket } from "../socket";
import { View } from "./camera";
import { CanvasCoord, Coord, ServerCoord } from "./coord";
import { LocalVertex } from "./vertex";

export enum ORIENTATION {
    UNDIRECTED,
    DIRECTED,
    DIGON
}


export class Link {
    // Server properties
    start_vertex: number;
    end_vertex: number;
    cp: ServerCoord;
    orientation: ORIENTATION;
    color: string;
    weight: string = "";

    // Client properties
    is_selected: boolean;
    weight_position: Coord = new Coord(0,0);
    weight_div: HTMLDivElement = null; // set to null until a non empty weight is used


    constructor(i: number, j: number, cp: ServerCoord, orientation: ORIENTATION, color: string) {
        this.start_vertex = i;
        this.end_vertex = j;
        this.color = color;
        this.is_selected = false;
        this.cp = new ServerCoord(cp.x, cp.y);
        this.orientation = orientation;
    }

    is_in_rect(c1: CanvasCoord, c2: CanvasCoord) {
        //V1: is in rect if one of its extremities is in the rectangle
        //TODO: be more clever and select also when there is an intersection between the edge and the rectangle

        return local_board.graph.vertices.get(this.start_vertex).is_in_rect(c1, c2) || local_board.graph.vertices.get(this.end_vertex).is_in_rect(c1, c2);
    }



    transform_control_point(moved_vertex: LocalVertex, fixed_vertex: LocalVertex, view: View) {
        const w = fixed_vertex.pos.canvas_pos;
        const u = moved_vertex.pos.old_canvas_pos.sub2(w);
        const nv = moved_vertex.pos.canvas_pos.sub2(w);
        const theta = nv.getTheta(u)
        const rho = u.getRho(nv)
        const old_cp = this.cp.old_canvas_pos;
        this.cp.canvas_pos.x = w.x + rho * (Math.cos(theta) * (old_cp.x - w.x) - Math.sin(theta) * (old_cp.y - w.y))
        this.cp.canvas_pos.y = w.y + rho * (Math.sin(theta) * (old_cp.x - w.x) + Math.cos(theta) * (old_cp.y - w.y))
        this.cp.update_from_canvas_pos(view);
    }

    save_pos() {
        this.cp.save_canvas_pos();
        //this.old_cp.x = this.cp.x;
        //this.old_cp.y = this.cp.y;
    }

    update_canvas_pos(view: View){
        this.cp.update_canvas_pos(view);
    }

    translate_cp(shift: CanvasCoord, view: View){
        this.cp.translate(shift, view);
    }

    tikzify_link(start: LocalVertex, start_index: number, end: LocalVertex, end_index: number) {
        // TODO: ORIENTED CASE
        let labelCode = "";
        // if (showLabels)
        // labelCode = "node[midway, shift={(" + this.label.getExactLabelOffsetX() / 100 + "," + -this.label.getExactLabelOffsetY() / 100 + ")}, scale = \\scaleE] {" + this.label.text + "}";

        return `\\draw[line width = \\scaleE, color = black] (${start.get_tikz_coordinate(start_index)}) .. controls (${Math.round(this.cp.x)/100}, ${Math.round(this.cp.y)/100}) .. (${end.get_tikz_coordinate(end_index)}) ${labelCode};`;

    }

    init_weight_div(link_index: number){
        this.weight_div = document.createElement("div");
        this.weight_div.classList.add("weight_link");
        document.body.appendChild(this.weight_div);

        const link = this;
        this.weight_div.addEventListener("wheel", function (e) {
            const weight_value = parseInt(link.weight);
            if ( isNaN(weight_value) == false){
                if (e.deltaY < 0) {
                    socket.emit("update_weight", link_index, String(weight_value+1));
                }else {
                    socket.emit("update_weight", link_index, String(weight_value-1));
                }
            }
        })

        this.weight_div.onclick = (e) => {
            if( interactor_loaded.name == "text"){
                validate_weight();
                display_weight_input(link_index, new CanvasCoord(this.weight_position.x, this.weight_position.y));
            }
            
        }
    }

    update_weight(value: string, link_index: number){
        this.weight = value;
        if ( this.weight_div == null){
            if ( value != ""){
                this.init_weight_div(link_index);
                this.weight_div.innerHTML = katex.renderToString(value);
            }
        }else {
            this.weight_div.innerHTML = katex.renderToString(value);
        }
    }

}
