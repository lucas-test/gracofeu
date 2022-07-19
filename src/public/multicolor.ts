import { invertColor, shadeColor } from "./draw";

export class Multicolor{
    color : string;
    contrast : string;
    darken : string;
    lighten : string; 


    constructor(color:string){
        this.color = color;
        this.contrast = invertColor(color);
        this.darken = shadeColor(color, -60);
        this.lighten = shadeColor(color, 120);
    }

    update(){
        this.contrast = invertColor(this.color);
        this.darken = shadeColor(this.color, -60);
        this.lighten = shadeColor(this.color, 120);
    }

    set_color(main_color:string){
        this.color = main_color;
        this.update();
    }
}