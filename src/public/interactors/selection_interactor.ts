
import { Coord } from '../../server/coord';
import { Vertex } from '../../server/vertex';
import { Edge } from '../../server/edge';
import { Graph } from '../../server/graph';

import {Interactor, DOWN_TYPE} from './interactor'

// INTERACTOR SELECTION

export var interactor_selection = new Interactor("selection", "s", "selection.svg")

interactor_selection.mousedown = ((down_type, down_element_index, canvas, ctx, g, e) => {
    if (down_type == DOWN_TYPE.VERTEX_NON_SELECTED) {
        let vertex = g.vertices.get(down_element_index);
        vertex.save_pos();
    }
})

interactor_selection.mousemove = ((canvas, ctx, g, e) => {
    console.log("mousemove");
    if (interactor_selection.last_down == DOWN_TYPE.VERTEX_NON_SELECTED) {
        let vertex = g.vertices.get(interactor_selection.last_down_index);
        vertex.update_pos_from_old(e.pageX - interactor_selection.last_down_pos.x, e.pageY - interactor_selection.last_down_pos.y)
        return true;
    }
    return false;
})

interactor_selection.mouseup = ((canvas, ctx, g, e) => {
    console.log("mouseup", interactor_selection.has_moved);
})