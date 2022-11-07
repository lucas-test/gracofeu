import { CanvasCoord, ServerCoord } from "../board/coord";
import { Graph } from "../board/graph";



export enum DOWN_TYPE {
    EMPTY = "EMPTY",
    VERTEX = "VERTEX",
    LINK = "LINK",
    CONTROL_POINT = "CONTROL_POINT",
    STROKE = "STROKE",
    AREA = "AREA",
    AREA_CORNER = "AREA_CORNER",
    AREA_SIDE = "AREA_SIDE",
    LINK_WEIGHT = "LINK_WEIGHT",
    VERTEX_WEIGHT = "VERTEX_WEIGHT"
}


export class Interactor {
    name: string;
    shortcut: string;
    img_src: string;
    interactable_element_type: Set<DOWN_TYPE>;
    cursor_style: string;
    mousedown: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: CanvasCoord) => void;
    mousemove: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: CanvasCoord) => boolean;
    mouseup: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: CanvasCoord) => void;
    trigger: (mouse_pos: CanvasCoord, g: Graph) => void;
    onleave: () => void;
    draw: (ctx: CanvasRenderingContext2D) => void;

    constructor(name: string, shortcut: string, img_src: string, interactable_element_type: Set<DOWN_TYPE>, cursor_style: string) {
        this.name = name;
        this.shortcut = shortcut;
        this.img_src = img_src;
        this.interactable_element_type = interactable_element_type;
        this.cursor_style = cursor_style;
        this.trigger = (e, g) => { };
        this.onleave = () => {};
        this.draw = () => {};
    }
}


