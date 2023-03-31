import { ORIENTATION_INFO } from "./element_side_bar";
import { ItemSideBar } from "./item_side_bar";
import { SideBar } from "./side_bar";


export class SwitchSideBar extends ItemSideBar {
    state: boolean;

    constructor(id:string, info: string, shortcut: string, orientation_info: ORIENTATION_INFO, img_src: string, cursor_style: string,my_sidebar? : SideBar)
    {
        super(id, info, shortcut, orientation_info, img_src, cursor_style, my_sidebar);
    }


    common_trigger(){
        if (this.state){
            this.dom.classList.remove("selected");
        } else {
            this.dom.classList.add("selected");
        }
        this.state = !this.state;
    }

}