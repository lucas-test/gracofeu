import { Vertex, Link, Stroke, Area, TextZone, SENSIBILITY } from "gramoloss";
import { BoardModification, ServerBoard } from "../modification";

export class AddElement implements BoardModification {
    kind: string;
    index: number;
    element: Vertex|Link|Stroke|Area|TextZone;
    
    constructor(kind: string, index: number, element: Vertex|Link|Stroke|Area|TextZone) {
        this.kind = kind;
        this.index = index;
        this.element = element;
    }

    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        if (this.kind == "TextZone"){
            if ( board.text_zones.has(this.index) ){
                return "index " + String(this.index) + " already exists in text_zones";
            } else {
                const element = this.element as TextZone;
                board.text_zones.set(this.index, element);
            }
        } else if (this.kind == "Vertex"){
            if ( board.graph.vertices.has(this.index) ){
                return "index " + String(this.index) + " already exists in vertices";
            } else {
                const element = this.element as Vertex;
                board.graph.vertices.set(this.index, element);
            }
        }else if (this.kind == "Link"){
            if ( board.graph.links.has(this.index) ){
                return "index " + String(this.index) + " already exists in links";
            } else {
                const link = this.element as Link;
                if (board.graph.check_link(link)){
                    board.graph.links.set(this.index, link);
                } else {
                    return "Error: link is not valid";
                }
            }
        }else if (this.kind == "Stroke"){
            if ( board.strokes.has(this.index) ){
                return "index " + String(this.index) + " already exists in strokes";
            } else {
                const element = this.element as Stroke;
                board.strokes.set(this.index, element);
            }
        }else if (this.kind == "Area"){
            if ( board.areas.has(this.index) ){
                return "index " + String(this.index) + " already exists in areas";
            } else {
                const element = this.element as Area;
                board.areas.set(this.index, element);
            }
        }
        return new Set();
    }

    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        if ( this.kind == "TextZone"){
            board.text_zones.delete(this.index);
        } else if (this.kind == "Stroke"){
            board.strokes.delete(this.index);
        } else if (this.kind == "Area"){
            board.areas.delete(this.index);
        } else if (this.kind == "Vertex"){
            board.graph.delete_vertex(this.index);
        } else if (this.kind == "Link"){
            board.graph.links.delete(this.index);
        }
        return new Set();
    }
}