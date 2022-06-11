
import { Coord } from '../../server/coord';
import { Vertex } from '../../server/vertex';
import { Edge } from '../../server/edge';
import { Graph } from '../../server/graph';

import { Interactor, DOWN_TYPE } from './interactor'
import { draw, draw_line, draw_circle, draw_vertex } from '../draw';
import { socket } from '../socket';
import { camera, view } from '../camera';
import { get_vertex_index_nearby, local_vertices } from '../local_graph';


// INTERACTOR EDGE

var index_last_created_vertex = null; // est ce qu'on peut pas intégrer ça dans interactor_edge directement ?


export var interactor_edge = new Interactor("edge", "e", "edition.svg");

interactor_edge.mousedown = ((d, k, canvas, ctx, g, e) => {
    if (d == DOWN_TYPE.EMPTY) {
        view.is_edge_creating = true;
        view.edge_creating_start = new Coord(e.pageX - camera.x, e.pageY - camera.y)
        view.edge_creating_end = {x: e.pageX, y : e.pageY};
        socket.emit("add_vertex", e.pageX - camera.x, e.pageY - camera.y, (response) => { index_last_created_vertex = response});
    }
    if (d === DOWN_TYPE.VERTEX) {
        let vertex = local_vertices.get(interactor_edge.last_down_index);
        view.is_edge_creating = true;
        view.edge_creating_start = vertex.pos;
        view.edge_creating_end = {x: e.pageX, y : e.pageY};
    }
})

interactor_edge.mousemove = ((canvas, ctx, g, e) => {
    if (interactor_edge.last_down == DOWN_TYPE.EMPTY) {
        view.edge_creating_end = {x: e.pageX, y : e.pageY};
        draw(canvas, ctx, g);


        return false;
    } else if (interactor_edge.last_down == DOWN_TYPE.VERTEX) {
        view.edge_creating_end = {x: e.pageX, y : e.pageY};
        draw(canvas, ctx, g);
        return false;
    }
    return false;
})

interactor_edge.mouseup = ((canvas, ctx, g, e) => {
    view.is_edge_creating = false;
    if (interactor_edge.last_down == DOWN_TYPE.VERTEX) {
        let index = get_vertex_index_nearby(e.pageX - camera.x, e.pageY - camera.y);
        if (index !== null && interactor_edge.last_down_index != index) { // there is a vertex nearby and it is not the previous one
            socket.emit("add_edge", interactor_edge.last_down_index, index);
        } else {

            if (interactor_edge.last_down_index !== index) { // We check if we are not creating a vertex on another one
                let save_last_down_index = interactor_edge.last_down_index; // see not below
                socket.emit("add_vertex", e.pageX - camera.x, e.pageY - camera.y, (response) => {
                     socket.emit("add_edge", save_last_down_index, response);
                     // we cant do socket.emit("add_edge", interactor_edge.last_down_index, response);
                     // because before the callback, interactor_edge.last_down_index will changed (and set to null)
                    });    
            }
        }
    } else if (interactor_edge.last_down === DOWN_TYPE.EMPTY) {
        let index = get_vertex_index_nearby(e.pageX - camera.x, e.pageY - camera.y);
        if (index !== null && index != index_last_created_vertex) {
            socket.emit("add_edge", index_last_created_vertex, index);
        } else {
            if (index_last_created_vertex !== index) { // We check if we are not creating another vertex where we created the one with the mousedown 
                socket.emit("add_vertex", e.pageX - camera.x, e.pageY - camera.y, (response) => {
                    socket.emit("add_edge", index_last_created_vertex, response);
                   });
                
            }
        }
    }

})