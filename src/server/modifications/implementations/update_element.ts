import { SENSIBILITY } from "gramoloss";
import { BoardModification, ServerBoard } from "../modification";

export class UpdateElement implements BoardModification {
    index: number;
    kind: string;
    param: string;
    new_value: any;
    old_value: any;
    
    constructor(index: number, kind: string, param: string, new_value: any, old_value: any){
        this.index = index;
        this.kind = kind;
        this.param = param;
        this.new_value = new_value;
        this.old_value = old_value;
    }

    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        if (this.kind == "TextZone" && board.text_zones.has(this.index)){
            board.text_zones.get(this.index)[this.param] = this.new_value;
            return new Set();
        } else if (this.kind == "Vertex" && board.graph.vertices.has(this.index)){
            board.graph.vertices.get(this.index)[this.param] = this.new_value;
            return new Set()
        }else if (this.kind == "Link" && board.graph.links.has(this.index)){
            board.graph.links.get(this.index)[this.param] = this.new_value;
            return new Set()
        }else if (this.kind == "Stroke" && board.strokes.has(this.index)){
            board.strokes.get(this.index)[this.param] = this.new_value;
            return new Set()
        }else if (this.kind == "Area" && board.areas.has(this.index)){
            board.areas.get(this.index)[this.param] = this.new_value;
            return new Set()
        }else {
            return "Error: index not in text_zones";
        }
    }

    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        if (this.kind == "TextZone" && board.text_zones.has(this.index)){
            board.text_zones.get(this.index)[this.param]  = this.old_value;
            return new Set();
        }else if (this.kind == "Vertex" && board.graph.vertices.has(this.index)){
            board.graph.vertices.get(this.index)[this.param] = this.old_value;
            return new Set([SENSIBILITY.COLOR])
        }else if (this.kind == "Link" && board.graph.links.has(this.index)){
            board.graph.links.get(this.index)[this.param] = this.old_value;
            return new Set()
        }else if (this.kind == "Stroke" && board.strokes.has(this.index)){
            board.strokes.get(this.index)[this.param] = this.old_value;
            return new Set()
        }else if (this.kind == "Area" && board.areas.has(this.index)){
            board.areas.get(this.index)[this.param] = this.old_value;
            return new Set()
        }
        return new Set();
    }
}