import { View } from "./camera";
import { Graph } from "./graph";

export class Board {
    graph: Graph;
    view: View;
    // strokes
    // areas

    constructor(){
        this.graph = new Graph();
        this.view = new View();
    }

    // method change_camera -> update_canvas_pos de tous les éléments
}