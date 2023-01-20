import { Coord, Link, ORIENTATION } from "gramoloss";
import katex from "katex";
import { DOWN_TYPE } from "../interactors/interactor";
import { interactor_loaded } from "../interactors/interactor_manager";
import { display_weight_input, validate_weight } from "../interactors/text";
import { local_board } from "../setup";
import { socket } from "../socket";
import { View } from "./camera";
import { CanvasVect } from "./vect";
import { CanvasCoord, ClientVertex } from "./vertex";



export class ClientLink extends Link {
    cp_canvas_pos: CanvasCoord | string;
    is_selected: boolean;
    weight_position: Coord = new Coord(0,0);
    weight_div: HTMLDivElement = null; // set to null until a non empty weight is used


    constructor(i: number, j: number, cp: Coord | string, orientation: ORIENTATION, color: string, weight: string, view: View) {
        super(i,j,cp,orientation,color,weight);
        if (typeof cp == "string"){
            this.cp_canvas_pos = "";
        } else {
            this.cp_canvas_pos = view.create_canvas_coord(cp);
        }
        this.is_selected = false;
        this.weight_div = null;
        this.weight_position = new Coord(0,0);
    }

    set_cp(new_cp: Coord, view: View){
        this.cp = new_cp;
        this.cp_canvas_pos = view.create_canvas_coord(new_cp);
    }

    is_in_rect(c1: CanvasCoord, c2: CanvasCoord) {
        //V1: is in rect if one of its extremities is in the rectangle
        //TODO: be more clever and select also when there is an intersection between the edge and the rectangle
        return local_board.graph.vertices.get(this.start_vertex).is_in_rect(c1, c2) || local_board.graph.vertices.get(this.end_vertex).is_in_rect(c1, c2);
    }

    update_after_view_modification(view: View){
        if ( typeof this.cp != "string"){
            this.cp_canvas_pos = view.create_canvas_coord(this.cp);
        }

    }


    /*
    transform_control_point(moved_vertex: ClientVertex, fixed_vertex: ClientVertex, view: View) {
        const w = fixed_vertex.canvas_pos;
        const u = moved_vertex.old_canvas_pos.sub2(w);
        const nv = moved_vertex.canvas_pos.sub2(w);
        const theta = nv.getTheta(u)
        const rho = u.getRho(nv)
        const old_cp = this.cp.old_canvas_pos;
        this.cp.canvas_pos.x = w.x + rho * (Math.cos(theta) * (old_cp.x - w.x) - Math.sin(theta) * (old_cp.y - w.y))
        this.cp.canvas_pos.y = w.y + rho * (Math.sin(theta) * (old_cp.x - w.x) + Math.cos(theta) * (old_cp.y - w.y))
        this.cp.update_from_canvas_pos(view);
    }
    */


    translate_cp_by_canvas_vect(shift: CanvasVect, view: View){
            if ( typeof this.cp != "string" && typeof this.cp_canvas_pos != "string"){
                this.cp_canvas_pos.translate_by_canvas_vect(shift);
                this.cp.x += shift.x/view.zoom; 
                this.cp.y += shift.y/view.zoom;
            }
    }

    tikzify_link(start: ClientVertex, start_index: number, end: ClientVertex, end_index: number) {
        // TODO: ORIENTED CASE
        let labelCode = "";
        // if (showLabels)
        // labelCode = "node[midway, shift={(" + this.label.getExactLabelOffsetX() / 100 + "," + -this.label.getExactLabelOffsetY() / 100 + ")}, scale = \\scaleE] {" + this.label.text + "}";
        if (typeof this.cp != "string" ){
            return `\\draw[line width = \\scaleE, color = black] (${start.get_tikz_coordinate(start_index)}) .. controls (${Math.round(this.cp.x)/100}, ${Math.round(this.cp.y)/100}) .. (${end.get_tikz_coordinate(end_index)}) ${labelCode};`;
        } else {
            return ``; // TODO
        }
        
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
                    socket.emit("update_element", "Link", link_index, "weight", String(weight_value+1));
                }else {
                    socket.emit("update_update", "Link", link_index, "weight", String(weight_value-1));
                }
            }
        })

        this.weight_div.onclick = (e) => {
            if( interactor_loaded.name == "text"){
                validate_weight();
                display_weight_input(link_index, new CanvasCoord(this.weight_position.x, this.weight_position.y),DOWN_TYPE.LINK);
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
