import { Coord } from "./local_graph";


class View {
    camera: Coord;
    grid_size: number;
    grid_show: boolean;
    is_edge_creating: boolean;
    edge_creating_start: Coord;
    edge_creating_end: Coord;

    is_rectangular_selecting: boolean;
    selection_corner_1: Coord;
    selection_corner_2: Coord;

    constructor() {
        this.camera = new Coord(0, 0);
        this.grid_size = 50;
        this.grid_show = false;
        this.is_edge_creating = false;
        this.is_rectangular_selecting = false;
    }


    toggle_grid() {
        this.grid_show = !this.grid_show;
        return this.grid_show;
    }

}

export let view = new View();

export let camera = new Coord(0, 0);