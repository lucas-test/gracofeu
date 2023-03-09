import { ClientGraph } from "../board/graph";
import { CanvasCoord } from "../board/vertex";
import { ElementMenu } from "./element_menu";

export  class ItemMenu extends ElementMenu {
    trigger: (mouse_pos: CanvasCoord, g: ClientGraph) => void;
    
    constructor(info: string, shortcut: string, img_src: string, cursor_style: string, id:string, parent_dom : HTMLElement) {
        super(info, shortcut, img_src, cursor_style, id, parent_dom); 
        this.trigger = (e, g) => { };
    }
    

    setup(parent_dom : HTMLElement){
        this.dom = document.getElementById(this.id);
        if(this.dom != null){
            console.error(`Failing create Item ${this.id}. The id already exists.`);
            this.dom.innerHTML = "";
        }
        else{
            this.dom = document.createElement("div");
            this.dom.id = this.id;
            this.dom.classList.add("menu_item");
        }
        
        this.img_dom = document.createElement("img");
        this.img_dom.src = this.img_src;
        this.img_dom.id = this.id+'_img';
        this.img_dom.classList.add("menu_element_img", "menu_item_img");
        
        parent_dom.appendChild(this.dom);
        this.dom.appendChild(this.img_dom);
    }


}
