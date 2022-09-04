import { Graph } from "../board/graph";
import { AttributesArray } from "./attribute";



export class GraphGenerator {
    name: string;
    attributes: AttributesArray;
    generate: () => Graph;

    constructor(name: string, attributes: AttributesArray) {
        this.name = name;
        this.attributes = attributes;
        this.generate = () => {return new Graph()};
    }
}

