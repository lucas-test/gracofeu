import { Vect, SENSIBILITY } from "gramoloss";
import { BoardModification, ServerBoard } from "../modification";

export class TranslateElements implements BoardModification {
    indices: Array<[string,number]>;
    shift: Vect;
    
    constructor(indices: Array<[string,number]>, shift: Vect){
        this.indices = indices;
        this.shift = shift;
    }

    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        for (const [kind, index] of this.indices) {
            if (kind == "TextZone"){
                if (board.text_zones.has(index)){
                    board.text_zones.get(index).pos.translate(this.shift);
                }else {
                    return "Error: index not in text_zones";
                }
            } else if (kind == "Stroke"){
                if (board.strokes.has(index)){
                    board.strokes.get(index).translate(this.shift);
                }else {
                    return "Error: index not in strokes";
                }
            } else if (kind == "Area"){
                if (board.areas.has(index)){
                    board.translate_areas(new Set([index]), this.shift);
                }else {
                    return "Error: index not in areas";
                }
            } else if (kind == "ControlPoint"){
                if (board.graph.links.has(index)){
                    const link = board.graph.links.get(index);
                    if ( typeof link.cp != "string"){
                        link.cp.translate(this.shift);
                    }
                }else {
                    return "Error: index not in links";
                }
            } else if (kind == "Vertex"){
                if( board.graph.vertices.has(index)){
                    board.graph.translate_vertices([index], this.shift);
                } else {
                    return "Error: index not in vertices";
                }
            }
        }
        return new Set();
    }

    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        for (const [kind, index] of this.indices) {
            if (kind == "TextZone"){
                if (board.text_zones.has(index)){
                    board.text_zones.get(index).pos.rtranslate(this.shift);
                }
            } else if (kind == "Stroke"){
                if (board.strokes.has(index)){
                    board.strokes.get(index).rtranslate(this.shift);
                }
            } else if (kind == "Area"){
                if (board.areas.has(index)){
                    board.translate_areas(new Set([index]), this.shift.opposite());               
                }
            } else if (kind == "ControlPoint"){
                if (board.graph.links.has(index)){
                    const link = board.graph.links.get(index);
                    if ( typeof link.cp != "string"){
                        link.cp.rtranslate(this.shift);
                    }
                }
            } else if (kind == "Vertex"){
                if( board.graph.vertices.has(index)){
                    board.graph.translate_vertices([index], this.shift.opposite());
                }
            }
        }
        return new Set();
    }
}