import { Coord, Graph } from "../local_graph";



export enum DOWN_TYPE {
    EMPTY,
    VERTEX,
    EDGE,
    ARC,
    CONTROL_POINT
}


export class Interactor {
    name: string;
    shortcut: string;
    img_src: string;
    last_down: DOWN_TYPE;
    last_down_index: number;
    last_down_pos: Coord;
    has_moved: boolean;
    mousedown: (down_type: DOWN_TYPE, down_element_index: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: MouseEvent) => void;
    mousemove: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: MouseEvent) => boolean;
    mouseup: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: MouseEvent) => void;

    constructor(name: string, shortcut: string, img_src: string) {
        this.name = name;
        this.shortcut = shortcut;
        this.img_src = img_src;
        this.has_moved = false;
        this.last_down = null;
        this.last_down_index = null;
    }
}


