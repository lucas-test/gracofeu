import { CanvasCoord } from "../board/vertex";
import { ElementSideBar, ORIENTATION_INFO, ORIENTATION_SIDE_BAR } from "./element_side_bar";
import { SideBar } from "./side_bar";

export enum FOLDER_EXPAND_DIRECTION{
    TOP = 1,
    LEFT = 2,
    BOTTOM = 3,
    RIGHT = 4
}



export class FolderSideBar extends ElementSideBar{
    
    next_sidebar: SideBar;
    expand_direction : FOLDER_EXPAND_DIRECTION;
    expand : (mouse_pos : CanvasCoord) => void;

    constructor(id:string, info: string, shortcut: string, orientation_info: ORIENTATION_INFO, img_src: string, cursor_style: string,  next_sidebar:SideBar, expand_direction : FOLDER_EXPAND_DIRECTION, my_sidebar?:SideBar) {
        super(id, info, shortcut, orientation_info, img_src, cursor_style, my_sidebar); 
        this.expand = (e) => { };
        this.expand_direction = expand_direction;
        this.next_sidebar = next_sidebar;
    }

    /**
     * Create and insert the HTMLElement into the sidebar the folder belongs. Also set up all the position.
     * Note: calls setup_element 
     * @param my_sidebar The sidebar the folder belongs
     */
    render(my_sidebar:SideBar){
        // set up the common div 
        super.render(my_sidebar);

        // append the sidebar contained in the folder, and hide it
        this.dom.appendChild(this.next_sidebar.dom);
        this.next_sidebar.hide();

        this.dom.classList.add("side_bar_folder");
        this.img_dom.classList.add("side_bar_folder_img");

        //TODO: Change 
        this.img_dom.addEventListener("click", () => {
            this.my_sidebar.unselect_all_other_elements(this);
            this.dom.classList.toggle("side_bar_expanded_folder");
            this.next_sidebar.toggle();
        });


        // We set up everything depending on the direction the folder expands
        switch(this.expand_direction){
            case(FOLDER_EXPAND_DIRECTION.TOP):
                this.dom.classList.add("side_bar_folder_expand_top");
                // We find the position of the sidebar the folder belongs
                const bottom = this.my_sidebar.dom.style.bottom===""?0:parseInt(this.my_sidebar.dom.style.bottom);
                // We set the next sidebar shifted by 60 px
                this.next_sidebar.dom.style.bottom = String(bottom+ 60) + "px";
                break;
            case(FOLDER_EXPAND_DIRECTION.LEFT):
                this.dom.classList.add("side_bar_folder_expand_left");
                const right = this.my_sidebar.dom.style.right===""?0:parseInt(this.my_sidebar.dom.style.right);
                this.next_sidebar.dom.style.right = String(right+ 60) + "px";
                break;
            case(FOLDER_EXPAND_DIRECTION.BOTTOM):
                this.dom.classList.add("side_bar_folder_expand_bottom");
                const top = this.my_sidebar.dom.style.top===""?0:parseInt(this.my_sidebar.dom.style.top);
                this.next_sidebar.dom.style.top = String(top+ 60) + "px";
                break;
            case(FOLDER_EXPAND_DIRECTION.RIGHT):
                this.dom.classList.add("side_bar_folder_expand_right");
                const left = this.my_sidebar.dom.style.left===""?0:parseInt(this.my_sidebar.dom.style.left);
                this.next_sidebar.dom.style.left = String(left+ 60) + "px";
                break;
        }
    }

    /**
     * Close the folder and recursively all the folders it may contain
     * @param reset boolean set to true if we want to reset the default image. Set at true by default.
     */
    unselect(reset?:boolean) {
        this.dom.classList.remove("side_bar_expanded_folder");
        // We hide its next side_bar
        this.next_sidebar.hide();
        for(const element of this.next_sidebar.elements){
            // We repeat recursively on the potential folders inside the current folder
            if(element instanceof FolderSideBar){
                element.unselect(reset);
            }
        }

        if(reset){
            // We reset the image to its default value
            this.reset_img();
        }
    }
}
