import { Vertex, Link, SENSIBILITY } from "gramoloss";
import { BoardModification, ServerBoard } from "../modification";

export class GraphPaste implements BoardModification {
    added_vertices: Map<number, Vertex>;
    added_links: Map<number, Link>;

    constructor(added_vertices, added_links){
        this.added_vertices = added_vertices;
        this.added_links = added_links;
    }


    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        for ( const [vertex_index, vertex] of this.added_vertices.entries()){
            board.graph.vertices.set(vertex_index, vertex);
        }
        for ( const [link_index, link] of this.added_links.entries()){
            board.graph.links.set(link_index, link);
        }
        return new Set([SENSIBILITY.ELEMENT]);
    }


    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        for ( const vertex_index of this.added_vertices.keys()){
            board.graph.vertices.delete(vertex_index);
        }
        for ( const link_index of this.added_links.keys()){
            board.graph.links.delete(link_index);
        }
        return new Set([SENSIBILITY.ELEMENT])
    }
}
