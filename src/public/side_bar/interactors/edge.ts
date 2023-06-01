// INTERACTOR EDGE

import { ORIENTATION, Vertex, Link } from "gramoloss";
import { ClientGraph } from "../../board/graph";
import { CanvasCoord } from "../../board/vertex";
import { draw_circle, draw_line, real_color, draw_head } from "../../draw_basics";
import { DOWN_TYPE } from "../../interactors/interactor";
import { last_down, last_down_index } from "../../interactors/interactor_manager";
import { local_board } from "../../setup";
import { ORIENTATION_INFO } from "../element_side_bar";
import { InteractorV2 } from "../interactor_side_bar";

var index_last_created_vertex = null; // est ce qu'on peut pas intégrer ça dans interactor_edge directement ?


export const edge_interactorV2 = new InteractorV2("edge", "Creating edges", "e", ORIENTATION_INFO.RIGHT, "img/interactors/edition.svg", "default", new Set([DOWN_TYPE.VERTEX]));

edge_interactorV2.mousedown = ((canvas, ctx, g: ClientGraph, e) => {
    if (last_down == DOWN_TYPE.EMPTY) {
        local_board.view.is_link_creating = true;
        const pos = g.align_position(e, new Set(), canvas, local_board.view);

        local_board.view.link_creating_start = pos;
        local_board.view.link_creating_type = ORIENTATION.UNDIRECTED;
        const server_pos = local_board.view.create_server_coord(pos);
        local_board.emit_add_element(new Vertex(server_pos.x, server_pos.y, ""), (response) => { index_last_created_vertex = response } );
    }
    if (last_down === DOWN_TYPE.VERTEX) {
        let vertex = g.vertices.get(last_down_index);
        local_board.view.is_link_creating = true;
        local_board.view.link_creating_start = vertex.canvas_pos;
    }
})

edge_interactorV2.mousemove = ((canvas, ctx, g: ClientGraph, e) => {
    local_board.view.creating_vertex_pos = g.align_position(e, new Set(), canvas, local_board.view);
    return true;
})

edge_interactorV2.mouseup = ((canvas, ctx, g: ClientGraph, e) => {
    local_board.view.is_link_creating = false;
    if (last_down == DOWN_TYPE.VERTEX) {
        let index = g.get_vertex_index_nearby(e);
        if (index !== null && last_down_index != index) { // there is a vertex nearby and it is not the previous one
            local_board.emit_add_element(new Link(last_down_index, index, "", ORIENTATION.UNDIRECTED, "black", ""), (response: number) => {});
        } else {

            if (last_down_index !== index) { // We check if we are not creating a vertex on another one
                let save_last_down_index = last_down_index; // see not below
                const mouse_canvas_coord = g.align_position(e, new Set(), canvas, local_board.view);
                const server_pos = local_board.view.create_server_coord(mouse_canvas_coord);
                local_board.emit_add_element(new Vertex(server_pos.x, server_pos.y, ""), (response) => { 
                    local_board.emit_add_element( new Link(save_last_down_index, response, "", ORIENTATION.UNDIRECTED, "black", ""), () => {} )
                });
            }
        }
    } else if (last_down === DOWN_TYPE.EMPTY) {
        let index = g.get_vertex_index_nearby(g.align_position(e, new Set(), canvas, local_board.view));
        if (index !== null && index != index_last_created_vertex) {
            local_board.emit_add_element( new Link( index_last_created_vertex, index, "", ORIENTATION.UNDIRECTED, "black", ""), (response: number) => {});
        } else {
            if (index_last_created_vertex !== index) { // We check if we are not creating another vertex where we created the one with the mousedown 
                const aligned_mouse_pos = g.align_position(e, new Set(), canvas, local_board.view);
                const server_pos = local_board.view.create_server_coord(aligned_mouse_pos);
                local_board.emit_add_element(new Vertex(server_pos.x, server_pos.y, ""), (response) => { 
                    local_board.emit_add_element( new Link(index_last_created_vertex, response, "", ORIENTATION.UNDIRECTED, "black", ""), () => {} )
                });
            }
        }
    }

})

edge_interactorV2.trigger = (mouse_pos: CanvasCoord) => {
    local_board.view.is_creating_vertex = true;
    local_board.view.creating_vertex_pos = mouse_pos;
}


edge_interactorV2.draw = (ctx: CanvasRenderingContext2D) => {
    if (local_board.view.is_creating_vertex){
        draw_circle(local_board.view.creating_vertex_pos, "grey", 10, 0.5, ctx);
    }
    if (local_board.view.is_link_creating) {
        draw_line(local_board.view.link_creating_start, local_board.view.creating_vertex_pos, ctx, real_color("black", local_board.view.dark_mode));
        if (local_board.view.link_creating_type == ORIENTATION.DIRECTED) {
            draw_head(ctx, local_board.view.link_creating_start, local_board.view.creating_vertex_pos);
        }
    }
}