import { CanvasCoord } from "../board/vertex";
import { ElementMenu } from "./element_menu";
import { ItemMenu } from "./item_menu";




export class FolderMenu extends ElementMenu{
    
    subitems: Array<ItemMenu>;
    subitems_dom : HTMLElement;

    expand : (mouse_pos : CanvasCoord) => void;

    constructor(info: string, shortcut: string, img_src: string, cursor_style: string, id:string, parent_dom : HTMLElement) {
        super(info, shortcut, img_src, cursor_style, id, parent_dom); 
        this.expand = (e) => { };
        this.subitems = new Array<ItemMenu>();
        this.subitems_dom = null;
    }

    setup_folder(parent_dom : HTMLElement){
        this.dom = document.getElementById(this.id);
        if(this.dom != null){
            console.error(`Failing create Folder ${this.id}. The id already exists.`);
        }
        else{
            this.dom = document.createElement("div");
            this.dom.id = this.id;
            this.dom.classList.add("menu_folder");
            
            this.img_dom = document.createElement("img");
            this.img_dom.src = this.img_src;
            this.img_dom.id = this.id+'_img';
            this.img_dom.classList.add("menu_element_img", "menu_folder_img")
            
            this.subitems_dom = document.createElement("div");
            this.subitems_dom.classList.add("menu_folder_container");
            this.setup();

            parent_dom.appendChild(this.dom);
            this.dom.appendChild(this.img_dom);
            this.dom.appendChild(this.subitems_dom);

        }

    }

    /**
     * Clears the DOM container for the folder's item if it exists. 
     */
    clear_items(){
        if(this.subitems_dom !== null){
            this.subitems_dom.innerHTML = "";
        }
    }
    
    /**
     * Clears the DOM container and put back all the items of this.subitems in it. 
     */
    setup(){
        this.clear_items();
        for(const item of this.subitems){
            item.setup(this.subitems_dom);
        }
    }
}
