import { Coord } from '../../server/coord';
import { Vertex } from '../../server/vertex';
import { Edge } from '../../server/edge';
import { Graph } from '../../server/graph';

import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import { camera } from '../camera';

// INTERACTOR SELECTION

export var interactor_selection = new Interactor("selection", "s", "selection.svg")
let down_coord: Coord;
let previous_camera: Coord;


interactor_selection.mousedown = ((down_type, down_element_index, canvas, ctx, g, e) => {
    if (down_type == DOWN_TYPE.VERTEX) {
        let vertex = g.vertices.get(down_element_index);
        vertex.save_pos();
        socket.emit("save_pos", down_element_index)
    } else if (down_type === DOWN_TYPE.EMPTY) {
        down_coord = new Coord(e.pageX, e.pageY);
        previous_camera = camera;
    }
})

interactor_selection.mousemove = ((canvas, ctx, g, e) => {
    console.log("mousemove");
    if (interactor_selection.last_down == DOWN_TYPE.VERTEX) {
        let vertex = g.vertices.get(interactor_selection.last_down_index);
        vertex.update_pos_from_old(e.pageX - interactor_selection.last_down_pos.x, e.pageY - interactor_selection.last_down_pos.y)
        socket.emit("update_pos_from_old", interactor_selection.last_down_index, e.pageX - interactor_selection.last_down_pos.x, e.pageY - interactor_selection.last_down_pos.y);
        return true;
    } else if (interactor_selection.last_down === DOWN_TYPE.EMPTY) {
        camera.x =  previous_camera.x + e.pageX - down_coord.x;
        camera.y =  previous_camera.y + e.pageY - down_coord.y;
        down_coord = new Coord(e.pageX, e.pageY);
        return true;
    }
    return false;
})

interactor_selection.mouseup = ((canvas, ctx, g, e) => {
    console.log("mouseup", interactor_selection.has_moved);
    if (interactor_selection.last_down === DOWN_TYPE.VERTEX) {
        if (interactor_selection.has_moved === false) {
            socket.emit('select_vertex', interactor_selection.last_down_index);
        }
    } else if (interactor_selection.last_down === DOWN_TYPE.EMPTY) {

        previous_camera = null;
        down_coord = null;
    }
})