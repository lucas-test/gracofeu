
import { Coord } from '../../server/coord';
import { Vertex } from '../../server/vertex';
import { Edge } from '../../server/edge';
import { Graph } from '../../server/graph';

import { Interactor, DOWN_TYPE } from './interactor'
import { draw, draw_line, draw_circle, draw_vertex } from '../draw';
import { socket } from '../socket';
import { camera } from '../camera';


// INTERACTOR EDGE

var index_last_created_vertex = null; // est ce qu'on peut pas intégrer ça dans interactor_edge directement ?


export var interactor_edge = new Interactor("edge", "e", "edition.svg");

interactor_edge.mousedown = ((d, k, canvas, ctx, g, e) => {

    if (d == DOWN_TYPE.EMPTY) {
        let index = g.add_vertex(e.pageX - camera.x, e.pageY - camera.y);
        socket.emit("add_vertex", e.pageX - camera.x, e.pageY - camera.y);
        // faudrait remplacer les deux instructions précédentes par :
        // let index = socket.add_vertex(..) pour chaque fonction de Graph 
        // on fait pas l'action en local
        // mais l'envoie au serveur
        // le serveur le fait
        // le serveur renvoie le résultat
        // chaque fonction de Graph serait automatiquement traitée en méthode sur socket
        index_last_created_vertex = index;
    }
    if (d === DOWN_TYPE.VERTEX) {
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
    } else if (interactor_edge.last_down == DOWN_TYPE.VERTEX) {
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
    if (interactor_edge.last_down == DOWN_TYPE.VERTEX) {
        let index = g.get_vertex_index_nearby(e.pageX, e.pageY, camera.x, camera.y);
        console.log(index, interactor_edge.last_down_index);
        if (index !== null && interactor_edge.last_down_index != index) { // there is a vertex nearby and it is not the previous one
            g.add_edge(interactor_edge.last_down_index, index);
            socket.emit("add_edge", interactor_edge.last_down_index, index);
        } else {
            if (interactor_edge.last_down_index !== index) { // We check if we are not creating a vertex on another one
                let index = g.add_vertex(e.pageX - camera.x, e.pageY - camera.y);
                socket.emit("add_vertex", e.pageX - camera.x, e.pageY - camera.y);
                g.add_edge(interactor_edge.last_down_index, index);
                socket.emit("add_edge", interactor_edge.last_down_index, index);
            }
        }
    } else if (interactor_edge.last_down === DOWN_TYPE.EMPTY) {
        let index = g.get_vertex_index_nearby(e.pageX, e.pageY, camera.x, camera.y);
        if (index !== null && index != index_last_created_vertex) {
            g.add_edge(index_last_created_vertex, index);
            socket.emit("add_edge", index_last_created_vertex, index);
        } else {
            if (index_last_created_vertex !== index) { // We check if we are not creating another vertex where we created the one with the mousedown 
                let new_vertex_index = g.add_vertex(e.pageX - camera.x, e.pageY - camera.y);
                socket.emit("add_vertex", e.pageX - camera.x, e.pageY - camera.y);
                g.add_edge(index_last_created_vertex, new_vertex_index);
                socket.emit("add_edge", index_last_created_vertex, new_vertex_index);
            }
        }
    }

})