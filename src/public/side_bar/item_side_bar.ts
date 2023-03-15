import { ClientGraph } from "../board/graph";
import { CanvasCoord } from "../board/vertex";
import { ElementSideBar } from "./element_side_bar";
import { FolderSideBar } from "./folder_side_bar";
import { SideBar } from "./side_bar";

export  class ItemSideBar extends ElementSideBar {
    trigger: (mouse_pos: CanvasCoord, g: ClientGraph) => void; 
    
    constructor(id:string, info: string, shortcut: string, img_src: string, cursor_style: string, my_sidebar? : SideBar) {
        super(id, info, shortcut, img_src, cursor_style, my_sidebar); 
        this.trigger = (e, g) => { };
    }
    

    unselect(reset?:boolean) {
        this.dom.classList.remove("bar_side_active_item");

        
        if(reset===true){
            // We reset the image to its default value
            this.reset_img();
        }
    }

    /**
     * Create and insert the HTMLElement into the sidebar the item belongs.
     * Note: calls setup_element 
     * @param my_sidebar The sidebar the item belongs
     */
    setup_specifics(my_sidebar: SideBar): void {
        this.setup_element(my_sidebar);
        this.dom.classList.add("side_bar_item");
        this.img_dom.classList.add( "side_bar_item_img");
    }


}
