import { View } from "./camera";
import { ClientGraph } from "./graph";

export class Board {
    graph: ClientGraph;
    view: View;
    // strokes
    // areas

    constructor(){
        this.graph = new ClientGraph();
        this.view = new View();
    }

    // method change_camera -> update_canvas_pos de tous les éléments
}