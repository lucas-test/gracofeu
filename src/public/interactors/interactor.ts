import { CanvasCoord, ServerCoord } from "../coord";
import { Graph } from "../local_graph";



export enum DOWN_TYPE {
    EMPTY = "EMPTY",
    VERTEX = "VERTEX",
    LINK = "LINK",
    CONTROL_POINT = "CONTROL_POINT",
    STROKE = "STROKE",
    AREA = "AREA",
    AREA_CORNER = "AREA_CORNER",
    AREA_SIDE = "AREA_SIDE"
}


export class Interactor {
    name: string;
    shortcut: string;
    img_src: string;
    interactable_element_type: Set<DOWN_TYPE>;
    last_down: DOWN_TYPE;
    last_down_index: number;
    last_down_pos: ServerCoord;
    has_moved: boolean;
    mousedown: (down_type: DOWN_TYPE, down_element_index: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: CanvasCoord) => void;
    mousemove: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: CanvasCoord) => boolean;
    mouseup: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: CanvasCoord) => void;
    trigger: (mouse_pos: CanvasCoord) => void;
    onleave: () => void;

    constructor(name: string, shortcut: string, img_src: string, interactable_element_type: Set<DOWN_TYPE>) {
        this.name = name;
        this.shortcut = shortcut;
        this.img_src = img_src;
        this.has_moved = false;
        this.last_down = null;
        this.last_down_index = null;
        this.interactable_element_type = interactable_element_type;
        this.trigger = (e) => { };
        this.onleave = () => {};
    }
}


