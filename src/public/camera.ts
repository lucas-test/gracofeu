import { Coord } from "../server/coord";

class View{
    camera:Coord;
    grid_size:number;
    grid_show:boolean;

    constructor(){
        this.camera = new Coord(0,0);
        this.grid_size = 50;
        this.grid_show = false; 
    }


    toggle_grid() {
        this.grid_show = !this.grid_show;
        return this.grid_show;
    }

}

export let view = new View();

export let camera = new Coord(0,0);