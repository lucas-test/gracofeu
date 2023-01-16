import { AttributesArray } from "../generators/attribute";

/// modify function : index is either "" either the index of an area
/// If index is "" then it refers to the whole graph
export class GraphModifyer {
    name: string;
    attributes: AttributesArray;
    modify: () => void;

    constructor(name: string, attributes: AttributesArray) {
        this.name = name;
        this.attributes = attributes;
        this.modify = () => { };
    }
}