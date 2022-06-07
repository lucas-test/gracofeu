
import { Coord } from '../../server/coord';
import { Vertex } from '../../server/vertex';
import { Edge } from '../../server/edge';
import { Graph } from '../../server/graph';

import { Interactor, DOWN_TYPE } from './interactor'
import { draw, draw_line, draw_circle, draw_vertex } from '../draw';
import { socket } from '../socket';


// INTERACTOR EDGE

var index_last_created_vertex = null; // est ce qu'on peut pas intégrer ça dans interactor_edge directement ?


export var interactor_edge = new Interactor("edge", "e", "edition.svg");

interactor_edge.mousedown = ((d, k, canvas, ctx, g, e) => {

    if (d == DOWN_TYPE.EMPTY) {
        let index = g.add_vertex(e.pageX, e.pageY);
        socket.emit("add_vertex", e.pageX, e.pageY);
        index_last_created_vertex = index;
    }
    if (d === DOWN_TYPE.VERTEX_NON_SELECTED || d === DOWN_TYPE.VERTEX_SELECTED) {
        console.log(k);
    }


})

interactor_edge.mousemove = ((canvas, ctx, g, e) => {
    // console.log("mousemove " , interactor_edge.last_down);
    console.log("mousemove");
    if (interactor_edge.last_down == DOWN_TYPE.EMPTY) {
        let vertex = g.vertices.get(index_last_created_vertex);
        draw(canvas, ctx, g);
        draw_line(vertex, e.pageX, e.pageY, ctx);
        draw_circle(e.pageX, e.pageY, ctx);
        draw_vertex(vertex, ctx); // for esthetic reasons
        return false;
    } else if (interactor_edge.last_down == DOWN_TYPE.VERTEX_NON_SELECTED || interactor_edge.last_down == DOWN_TYPE.VERTEX_SELECTED) {
        let vertex = g.vertices.get(interactor_edge.last_down_index);
        draw(canvas, ctx, g);
        draw_line(vertex, e.pageX, e.pageY, ctx);
        draw_circle(e.pageX, e.pageY, ctx);
        draw_vertex(vertex, ctx); // for esthetic reasons
        return false;
    }
    return false;
})

interactor_edge.mouseup = ((canvas, ctx, g, e) => {
    console.log("mouseup ", interactor_edge.last_down);
    if (interactor_edge.last_down == DOWN_TYPE.VERTEX_NON_SELECTED || interactor_edge.last_down == DOWN_TYPE.VERTEX_SELECTED) {
        let index = g.get_vertex_index_nearby(e.pageX, e.pageY);
        console.log(index, interactor_edge.last_down_index);
        if (index !== null && interactor_edge.last_down_index != index) { // there is a vertex nearby and it is not the previous one
            g.add_edge(interactor_edge.last_down_index, index);
            socket.emit("add_edge", interactor_edge.last_down_index, index);
        } else {
            if (interactor_edge.last_down_index !== index) { // We check if we are not creating a vertex on another one
                let index = g.add_vertex(e.pageX, e.pageY);
                socket.emit("add_vertex", e.pageX, e.pageY);
                g.add_edge(interactor_edge.last_down_index, index);
                socket.emit("add_edge", interactor_edge.last_down_index, index);
            }
        }
    } else if (interactor_edge.last_down === DOWN_TYPE.EMPTY) {
        let index = g.get_vertex_index_nearby(e.pageX, e.pageY);
        if (index !== null && index != index_last_created_vertex) {
            g.add_edge(index_last_created_vertex, index);
            socket.emit("add_edge", index_last_created_vertex, index);
        } else {
            if (index_last_created_vertex !== index) { // We check if we are not creating another vertex where we created the one with the mousedown 
                let new_vertex_index = g.add_vertex(e.pageX, e.pageY);
                socket.emit("add_vertex", e.pageX, e.pageY);
                g.add_edge(index_last_created_vertex, new_vertex_index);
                socket.emit("add_edge", index_last_created_vertex, new_vertex_index);
            }
        }
    }

})