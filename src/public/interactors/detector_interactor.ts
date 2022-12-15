import { Coord } from 'gramoloss';
import { ClientGraph } from '../board/graph';
import { ClientLink } from '../board/link';
import { CanvasCoord, ClientVertex } from '../board/vertex';
import { local_board } from '../setup';
import { Interactor, DOWN_TYPE } from './interactor'

// INTERACTOR DETECTOR

export const interactor_detector = new Interactor("detector", "d", "detector.svg", new Set([DOWN_TYPE.VERTEX, DOWN_TYPE.LINK, DOWN_TYPE.STROKE]), 'default')

const infobox = document.createElement("div");
infobox.id = "the_infobox";
infobox.classList.add("detector_infobox");
document.body.appendChild(infobox);
let is_infobox_displayed = false;

function set_element_infobox(pos: Coord) {
    is_infobox_displayed = true;
    infobox.style.display = "block";
    infobox.style.top = String(pos.y+5) + "px";
    infobox.style.left = String(pos.x+10) + "px";
}

function set_vertex_infobox(index: number, vertex: ClientVertex, pos: Coord){
    set_element_infobox(pos);
    infobox.innerHTML = 
    "Vertex index: " + index + "<br>" +
    "x: " + vertex.pos.x + "<br>" +
    "y: " + vertex.pos.y + "<br>"+
    "color: " + vertex.color + "<br>" +
    "canvas_x: " + Math.floor(vertex.canvas_pos.x) + "<br>" +
    "canvas_y: " + Math.floor(vertex.canvas_pos.y);
}

function set_link_infobox(link: ClientLink, pos: Coord){
    set_element_infobox(pos);
    infobox.innerHTML = JSON.stringify(link, null, "&nbsp&nbsp&nbsp").replace(/\n/g, "<br />");;
}

function turn_off_infobox() {
    is_infobox_displayed = false;
    infobox.style.display = "none";
}


interactor_detector.mousedown = ((canvas, ctx, g, e) => { });

interactor_detector.mousemove = ((canvas, ctx, g: ClientGraph, e: CanvasCoord) => {
    g.clear_all_selections();
    const element = local_board.get_element_nearby(e, interactor_detector.interactable_element_type);
    switch (element.type) {
        case DOWN_TYPE.VERTEX:
            const vertex = g.vertices.get(element.index);
            set_vertex_infobox(element.index, vertex, e);
            vertex.is_selected = true;
            return true;
        case DOWN_TYPE.STROKE:
            const stroke = g.strokes.get(element.index);
            stroke.is_selected = true;
            return true;
        case DOWN_TYPE.LINK:
            const link = g.links.get(element.index);
            set_link_infobox(link, e);
            link.is_selected = true;
            return true;
    }
    turn_off_infobox();
    return true;
});

interactor_detector.mouseup = ((canvas, ctx, g, e) => { });