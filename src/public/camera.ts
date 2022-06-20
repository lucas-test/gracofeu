import { CanvasCoord, Coord, ORIENTATION, ServerCoord } from "./local_graph";

export enum INDEX_TYPE {
    NONE,
    NUMBER_STABLE,
    NUMBER_UNSTABLE,
    ALPHA_STABLE,
    ALPHA_UNSTABLE
}

class View {
    camera: Coord;
    zoom: number;
    grid_size: number;
    grid_show: boolean;
    is_link_creating: boolean;
    link_creating_type: ORIENTATION;
    link_creating_start: CanvasCoord;
    link_creating_end: CanvasCoord;

    is_rectangular_selecting: boolean;
    selection_corner_1: CanvasCoord;
    selection_corner_2: CanvasCoord;

    is_aligning: boolean;
    alignement_horizontal: boolean;
    alignement_horizontal_y: number;
    alignement_vertical: boolean;
    alignement_vertical_x: number;

    index_type: INDEX_TYPE;

    constructor() {
        this.camera = new Coord(0, 0);
        this.zoom = 1.;
        this.grid_size = 50;
        this.grid_show = false;
        this.is_link_creating = false;
        this.is_rectangular_selecting = false;
        this.index_type = INDEX_TYPE.NONE;
        this.is_aligning = false;
        this.alignement_horizontal = false;
        this.alignement_vertical = false;
    }


    toggle_grid() {
        this.grid_show = !this.grid_show;
        return this.grid_show;
    }

    // transform serverCoord to canvasCoord
    canvasCoord(pos: ServerCoord): CanvasCoord {
        return new CanvasCoord(pos.x * this.zoom + this.camera.x, pos.y * this.zoom + this.camera.y);
    }

    canvasCoord2(x: number, y: number): CanvasCoord {
        return new CanvasCoord(x * this.zoom + this.camera.x, y * this.zoom + this.camera.y);
    }

    canvasCoordX(x:number){
        return x*this.zoom + this.camera.x;
    }

    canvasCoordY(y:number){
        return y*this.zoom + this.camera.y;
    }

    // transform canvasCoord to serverCoord
    serverCoord(e: MouseEvent): ServerCoord {
        const ce = new CanvasCoord(e.pageX, e.pageY);
        return this.serverCoord2(ce);
    }

    serverCoord2(pos: CanvasCoord): ServerCoord {
        return new ServerCoord((pos.x - this.camera.x) / view.zoom, (pos.y - this.camera.y) / view.zoom);
    }

    // zoom factor is multiply by r
    apply_zoom(center: MouseEvent, r: number) {
        this.zoom *= r;
        this.camera.x = center.pageX + (this.camera.x - center.pageX) * r;
        this.camera.y = center.pageY + (this.camera.y - center.pageY) * r;
    }


}

export let view = new View();
