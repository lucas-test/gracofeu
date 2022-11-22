import { View } from "../board/camera";
import { ClientGraph } from "../board/graph";
import { CanvasCoord } from "../board/vertex";
import { AttributesArray } from "./attribute";



export class GraphGenerator {
    name: string;
    attributes: AttributesArray;
    generate: (pos: CanvasCoord, view: View) => ClientGraph;

    constructor(name: string, attributes: AttributesArray) {
        this.name = name;
        this.attributes = attributes;
        this.generate = () => { return new ClientGraph() };
    }
}

