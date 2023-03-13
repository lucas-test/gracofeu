import { ClientGraph } from "../board/graph";
import { CanvasCoord } from "../board/vertex";






export enum DOWN_TYPE {
    EMPTY = "EMPTY",
    VERTEX = "VERTEX",
    LINK = "LINK",
    CONTROL_POINT = "CONTROL_POINT",
    STROKE = "STROKE",
    AREA = "AREA",
    LINK_WEIGHT = "LINK_WEIGHT",
    VERTEX_WEIGHT = "VERTEX_WEIGHT",
    TEXT_ZONE = "TEXT_ZONE",
    REPRESENTATION_ELEMENT = "REPRESENTATION_ELEMENT",
    RESIZE = "RESIZE",
    REPRESENTATION = "REPRESENTATION",
    RECTANGLE = "RECTANGLE"
}

export enum RESIZE_TYPE {
    BOTTOM = "BOTTOM",
    TOP = "TOP",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    TOP_RIGHT = "TOP_RIGHT",
    TOP_LEFT = "TOP_LEFT",
    BOTTOM_RIGHT = "BOTTOM_RIGHT",
    BOTTOM_LEFT = "BOTTOM_LEFT"
}

export namespace RESIZE_TYPE {
    export function to_cursor(resize_type: RESIZE_TYPE): string {
        switch(resize_type){
            case RESIZE_TYPE.TOP_LEFT:
                return "nw-resize";
            case RESIZE_TYPE.TOP_RIGHT:
                return "ne-resize";
            case RESIZE_TYPE.BOTTOM_RIGHT:
                return "se-resize";
            case RESIZE_TYPE.BOTTOM_LEFT:
                return "sw-resize";
            case RESIZE_TYPE.RIGHT:
                return "e-resize";
            case RESIZE_TYPE.LEFT:
                return "w-resize";
            case RESIZE_TYPE.TOP:
                return "n-resize";
            case RESIZE_TYPE.BOTTOM:
                return "s-resize";
            default:
                return "default";
        }
    }
}


export class Interactor {
    name: string;
    shortcut: string;
    img_src: string;
    interactable_element_type: Set<DOWN_TYPE>;
    cursor_style: string;
    subinteractors: Array<Interactor>;
    
    mousedown: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: ClientGraph, e: CanvasCoord) => void;
    mousemove: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: ClientGraph, e: CanvasCoord) => boolean;
    mouseup: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: ClientGraph, e: CanvasCoord) => void;
    trigger: (mouse_pos: CanvasCoord, g: ClientGraph) => void;
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
        this.subinteractors = new Array<Interactor>();
    }
}


