import { Coord, Graph, ORIENTATION, Vect } from "gramoloss";
import { update_users_canvas_pos } from "../user";
import { ClientGraph } from "./graph";
import { ClientLink } from "./link";
import { ClientStroke } from "./stroke";
import { CanvasVect } from "./vect";
import { CanvasCoord, ClientVertex } from "./vertex";

export enum INDEX_TYPE {
    NONE,
    NUMBER_STABLE,
    NUMBER_UNSTABLE,
    ALPHA_STABLE,
    ALPHA_UNSTABLE
}

export class View {
    camera: Coord;
    old_camera: Coord;
    zoom: number;
    grid_size: number;
    grid_min_size: number;
    grid_max_size: number;
    grid_initial_size: number;
    grid_show: boolean;
    
    is_link_creating: boolean;
    link_creating_type: ORIENTATION;
    link_creating_start: CanvasCoord;

    is_creating_vertex: boolean;
    creating_vertex_pos: CanvasCoord;

    is_rectangular_selecting: boolean;
    selection_corner_1: CanvasCoord;
    selection_corner_2: CanvasCoord;

    is_aligning: boolean;
    alignement_horizontal: boolean;
    alignement_horizontal_y: number;
    alignement_vertical: boolean;
    alignement_vertical_x: number;

    index_type: INDEX_TYPE;

    following: string;

    dark_mode: boolean;

    is_drawing_interactor: boolean;

    // window_height:number;
    // window_width:number;

    constructor() {
        this.camera = new Coord(0, 0);
        this.old_camera = new Coord(0, 0);
        this.zoom = 1.;
        this.grid_min_size = 40;
        this.grid_max_size = 80;
        this.grid_initial_size = 50;
        this.grid_size = this.grid_initial_size;
        this.grid_show = false;
        this.is_link_creating = false;
        this.is_rectangular_selecting = false;
        this.index_type = INDEX_TYPE.NONE;
        this.is_aligning = false;
        this.alignement_horizontal = false;
        this.alignement_vertical = false;

        this.is_creating_vertex = false;
        this.creating_vertex_pos = new CanvasCoord(0,0);

        this.following = null;

        this.dark_mode = true;
        this.is_drawing_interactor = true;
        // this.window_width = window.innerWidth;
        // this.window_height = window.innerHeight;
    }

    save_camera(){
        this.old_camera.copy_from(this.camera);
    }

    toggle_grid() {
        this.grid_show = !this.grid_show;
        return this.grid_show;
    }


    // zoom factor is multiply by r
    apply_zoom_to_center(center: CanvasCoord, r: number) {
        this.zoom *= r;
        this.camera.x = center.x + (this.camera.x - center.x) * r;
        this.camera.y = center.y + (this.camera.y - center.y) * r;

        this.grid_size = this.grid_initial_size * this.zoom;
        while (this.grid_size > this.grid_max_size){
            this.grid_size /= 2;
        }
        while (this.grid_size < this.grid_min_size){
            this.grid_size *= 2;
        }
    }

    translate_camera(shift: Coord){
        this.camera.translate(shift); // camera = camera + shift
    }

    server_vect(v: CanvasVect): Vect{
        return new Vect( v.x/this.zoom, v.y/this.zoom);
    }

    create_canvas_vect(v: Vect): CanvasVect {
        return new CanvasVect(v.x*this.zoom, v.y*this.zoom)
    }

    create_server_coord(c: CanvasCoord){
        return new Coord( (c.x - this.camera.x)/ this.zoom, (c.y - this.camera.y)/ this.zoom);
    }

    create_server_coord_from_subtranslated(c: CanvasCoord, shift: CanvasVect): Coord{
        const c2 = new CanvasCoord(c.x - shift.x, c.y - shift.y);
        return this.create_server_coord(c2);
    }

    create_canvas_coord(c: Coord){
        return new CanvasCoord(c.x*this.zoom + this.camera.x, c.y*this.zoom+this.camera.y);
    }

    canvasCoordX(c: Coord): number{
        return c.x*this.zoom + this.camera.x;
    }

    canvasCoordY(c: Coord): number{
        return c.y*this.zoom + this.camera.y;
    }

}



export function center_canvas_on_rectangle(view: View, top_left:CanvasCoord, bot_right:CanvasCoord, canvas: HTMLCanvasElement, g:ClientGraph){
    const w = bot_right.x - top_left.x;
    const h = bot_right.y - top_left.y;
    const shift_x = (canvas.width - w)/2 - top_left.x;
    const shift_y = (canvas.height - h)/2 - top_left.y;

    view.translate_camera(new Coord(shift_x, shift_y));

    if ( w <= 0 || h <= 0 ){
        g.update_canvas_pos(view);
        update_users_canvas_pos(view);
        return;
    }

    const ratio_w = canvas.width/w;
    const ratio_h = canvas.height/h;

    const center = new CanvasCoord(canvas.width/2, canvas.height/2);
    view.apply_zoom_to_center(center, Math.min(ratio_h, ratio_w)*0.8);
    g.update_canvas_pos(view);
    update_users_canvas_pos(view);
}

