import { Vertex, Link, Stroke, Area, TextZone, Representation, SENSIBILITY } from "gramoloss";
import { BoardModification, ServerBoard } from "../modification";

export class DeleteElements implements BoardModification {
    vertices: Map<number, Vertex>;
    links: Map<number, Link>;
    strokes: Map<number, Stroke>;
    areas: Map<number, Area>;
    text_zones: Map<number, TextZone>;

    constructor(vertices, links, strokes, areas, text_zones) {
        this.vertices = vertices;
        this.links = links;
        this.strokes = strokes;
        this.areas = areas;
        this.text_zones = text_zones;
    }

    static from_indices<V extends Vertex,L extends Link, S extends Stroke, A extends Area, T extends TextZone, R extends Representation>(board: ServerBoard, indices: Array<[string, number]>){
        const vertices = new Map();
        const links = new Map();
        const strokes = new Map();
        const areas = new Map();
        const text_zones = new Map();
        for (const [kind, index] of indices){
            if (kind == "Vertex"){
                vertices.set(index, board.graph.vertices.get(index));
                board.graph.links.forEach((link, link_index) => {
                    if (link.end_vertex === index || link.start_vertex === index) {
                        links.set(link_index, link);
                    }
                })
            } else if (kind == "Link"){
                links.set(index, board.graph.links.get(index));
            } else if (kind == "Stroke"){
                strokes.set(index, board.strokes.get(index));
            } else if (kind == "Area"){
                areas.set(index, board.areas.get(index));
            } else if (kind == "TextZone"){
                text_zones.set(index, board.text_zones.get(index));
            } else {
                return "Error: kind not supported " + kind
            }
        }
        return new DeleteElements(vertices, links, strokes, areas, text_zones);
    }

    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        for (const index of this.vertices.keys()) {
            board.graph.delete_vertex(index);
        }
        for (const index of this.links.keys()) {
            board.graph.delete_link(index);
        }
        for (const index of this.strokes.keys()) {
            board.delete_stroke(index);
        }
        for (const index of this.areas.keys()) {
            board.delete_area(index);
        }
        for (const index of this.text_zones.keys()){
            board.text_zones.delete(index);
        }
        // TODO set is false
        return new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC, SENSIBILITY.WEIGHT])
    }


    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        for (const [index, vertex] of this.vertices.entries()) {
            board.graph.vertices.set(index, vertex);
        }
        for (const [index, link] of this.links.entries()) {
            board.graph.links.set(index, link);
        }
        for (const [index, stroke] of this.strokes.entries()) {
            board.strokes.set(index, stroke);
        }
        for (const [index, area] of this.areas.entries()) {
            board.areas.set(index, area);
        }
        for (const [index, text_zone] of this.text_zones.entries()){
            board.text_zones.set(index, text_zone);
        }
        return new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC, SENSIBILITY.WEIGHT])
    }
}