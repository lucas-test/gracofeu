import { local_board } from "../setup";
import { CanvasCoord, ServerCoord } from "./coord";
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

    // local attributes
    old_cp: ServerCoord;
    is_selected: boolean;
    canvas_cp: CanvasCoord;


    constructor(i: number, j: number, cp: ServerCoord, orientation: ORIENTATION, color: string) {
        this.start_vertex = i;
        this.end_vertex = j;
        this.color = color;
        this.is_selected = false;
        this.cp = new ServerCoord(cp.x, cp.y);
        this.old_cp = new ServerCoord(cp.x, cp.y);
        this.orientation = orientation;
        this.canvas_cp = local_board.view.canvasCoord(this.cp)
    }

    is_in_rect(c1: CanvasCoord, c2: CanvasCoord) {
        //V1: is in rect if one of its extremities is in the rectangle
        //TODO: be more clever and select also when there is an intersection between the edge and the rectangle

        return local_board.graph.vertices.get(this.start_vertex).is_in_rect(c1, c2) || local_board.graph.vertices.get(this.end_vertex).is_in_rect(c1, c2);
    }



    transform_control_point(moved_vertex: LocalVertex, fixed_vertex: LocalVertex) {
        var v = moved_vertex
        var w = fixed_vertex.pos
        let u = v.old_pos.sub(w);
        let nv = v.pos.sub(w);
        var theta = nv.getTheta(u)
        var rho = u.getRho(nv)
        this.cp.x = w.x + rho * (Math.cos(theta) * (this.old_cp.x - w.x) - Math.sin(theta) * (this.old_cp.y - w.y))
        this.cp.y = w.y + rho * (Math.sin(theta) * (this.old_cp.x - w.x) + Math.cos(theta) * (this.old_cp.y - w.y))
        this.canvas_cp = local_board.view.canvasCoord(this.cp);
    }

    save_pos() {
        this.old_cp.x = this.cp.x;
        this.old_cp.y = this.cp.y;
    }

    tikzify_link(start: LocalVertex, start_index: number, end: LocalVertex, end_index: number) {
        // TODO: ORIENTED CASE
        let labelCode = "";
        // if (showLabels)
        // labelCode = "node[midway, shift={(" + this.label.getExactLabelOffsetX() / 100 + "," + -this.label.getExactLabelOffsetY() / 100 + ")}, scale = \\scaleE] {" + this.label.text + "}";

        return `\\draw[line width = \\scaleE, color = black] (${start.get_tikz_coordinate(start_index)}) .. controls (${Math.round(this.cp.x)/100}, ${Math.round(this.cp.y)/100}) .. (${end.get_tikz_coordinate(end_index)}) ${labelCode};`;

    }


}
