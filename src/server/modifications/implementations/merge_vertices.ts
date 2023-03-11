import { Vertex, Link, SENSIBILITY, Graph, eqSet } from "gramoloss";
import { BoardModification, ServerBoard } from "../modification";

export class MergeVertices implements BoardModification {
    index_vertex_fixed: number;
    index_vertex_to_remove: number;
    vertex_to_remove: Vertex;
    deleted_links: Map<number, Link>;
    modified_links_indices: Array<number>;

    constructor(index_vertex_fixed: number, index_vertex_to_remove: number, vertex_to_remove: Vertex, deleted_links: Map<number, Link>, modified_links_indices: Array<number>) {
        this.index_vertex_fixed = index_vertex_fixed;
        this.index_vertex_to_remove = index_vertex_to_remove;
        this.vertex_to_remove = vertex_to_remove;
        this.deleted_links = deleted_links;
        this.modified_links_indices = modified_links_indices;
    }

    try_implement(board: ServerBoard): Set<SENSIBILITY> | string{
        const v_fixed = board.graph.vertices.get(this.index_vertex_fixed);

        for (const link_index of this.deleted_links.keys()){
            board.graph.links.delete(link_index);
        }
        for (const link_index of this.modified_links_indices.values()){
            if (board.graph.links.has(link_index)){
                const link = board.graph.links.get(link_index);
                if ( link.start_vertex == this.index_vertex_to_remove){
                    link.start_vertex = this.index_vertex_fixed;
                    const fixed_end = board.graph.vertices.get(link.end_vertex);
                    link.transform_cp(v_fixed.pos, this.vertex_to_remove.pos, fixed_end.pos);
                } else if ( link.end_vertex == this.index_vertex_to_remove){
                    link.end_vertex = this.index_vertex_fixed;
                    const fixed_end = board.graph.vertices.get(link.start_vertex);
                    link.transform_cp(v_fixed.pos, this.vertex_to_remove.pos, fixed_end.pos);
                }
            }
        }
        board.graph.delete_vertex(this.index_vertex_to_remove);
        return new Set([SENSIBILITY.ELEMENT, SENSIBILITY.COLOR, SENSIBILITY.GEOMETRIC, SENSIBILITY.WEIGHT])
    }

    deimplement(board: ServerBoard): Set<SENSIBILITY>{
        const v_fixed = board.graph.vertices.get(this.index_vertex_fixed);

        board.graph.vertices.set(this.index_vertex_to_remove, this.vertex_to_remove);
        for (const [link_index, link] of this.deleted_links.entries()) {
            board.graph.links.set(link_index, link);
        }
        for (const link_index of this.modified_links_indices.values()) {
            if ( board.graph.links.has(link_index)){
                const link = board.graph.links.get(link_index);
                if (link.start_vertex == this.index_vertex_fixed){
                    link.start_vertex = this.index_vertex_to_remove;
                    const fixed_end = board.graph.vertices.get(link.end_vertex);
                    link.transform_cp(this.vertex_to_remove.pos, v_fixed.pos, fixed_end.pos);
                } else if (link.end_vertex == this.index_vertex_fixed ){
                    link.end_vertex = this.index_vertex_to_remove;
                    const fixed_end = board.graph.vertices.get(link.start_vertex);
                    link.transform_cp(this.vertex_to_remove.pos, v_fixed.pos, fixed_end.pos);
                }
            }
        }
        return new Set([]);
    }

    // does not modify the graph
    // any link between fixed and remove are deleted
    // any link such that one of its endpoints is "remove", is either deleted either modified
    static from_graph(graph: Graph<Vertex,Link>, vertex_index_fixed: number, vertex_index_to_remove: number ): MergeVertices{
        const v_to_remove = graph.vertices.get(vertex_index_to_remove);
        const deleted_links = new Map();
        const modified_links_indices = new Array();

        for ( const [link_index, link] of graph.links.entries()) {
            const endpoints = new Set([link.start_vertex, link.end_vertex]);
            if ( eqSet(endpoints, new Set([vertex_index_fixed, vertex_index_to_remove])) ){
                deleted_links.set(link_index, link);
            } else if (link.end_vertex == vertex_index_to_remove) {
                let is_deleted = false;
                for (const [index2, link2] of graph.links.entries()) {
                    if ( index2 != link_index && link2.signature_equals(link.start_vertex, vertex_index_fixed, link.orientation )){
                        deleted_links.set(link_index, link);
                        is_deleted = true;
                        break;
                    }
                }
                if ( is_deleted == false ){
                    modified_links_indices.push(link_index);
                }
            } else if (link.start_vertex == vertex_index_to_remove) {
                let is_deleted = false;
                for (const [index2, link2] of graph.links.entries()) {
                    if ( index2 != link_index && link2.signature_equals(vertex_index_fixed, link.end_vertex, link.orientation)){
                        deleted_links.set(link_index, link);
                        is_deleted = true;
                        break;
                    }
                }
                if ( is_deleted == false ){
                    modified_links_indices.push(link_index);
                }
            }
        }

        return new MergeVertices(vertex_index_fixed, vertex_index_to_remove, v_to_remove, deleted_links, modified_links_indices);
    }
}
