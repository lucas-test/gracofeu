import { ClientGraph } from "../board/graph";
import { CanvasCoord } from "../board/vertex";
import { ElementMenu, ORIENTATION_MENU } from "./element_menu";



export class SideBar {
    orientation: ORIENTATION_MENU;
    elements : Array<ElementMenu>;
    id : string;
    dom : HTMLElement;

    constructor(id: string, orientation:ORIENTATION_MENU){
        this.id = id;
        this.orientation = orientation;
        this.dom = document.getElementById(this.id);
        if(this.dom != null){
            console.error(`Failing create Menu ${this.id}. The id already exists.`);
            this.dom.innerHTML = "";
        }
        else{
            this.dom = document.createElement("div");
            this.dom.id = this.id;
        }
        this.dom.classList.add("menu_bar");

        switch(orientation){
            case(ORIENTATION_MENU.HORIZONTAL):
                this.dom.classList.add("menu_horizontal");
                break;
            case(ORIENTATION_MENU.VERTICAL):
                this.dom.classList.add("menu_vertical");
                break;
            default:
                break;
        }
        
    }  
    
    setup_menu(){
        for(const item of this.elements){
            item.setup(this.dom);
        }
    }
}

