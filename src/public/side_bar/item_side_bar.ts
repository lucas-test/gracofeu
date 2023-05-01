import { CanvasCoord } from "../board/vertex";
import { draw } from "../draw";
import { local_board } from "../setup";
import { ElementSideBar, ORIENTATION_INFO } from "./element_side_bar";
import { SideBar } from "./side_bar";


export abstract class ItemSideBar extends ElementSideBar {
    trigger: (mouse_pos:CanvasCoord) => void; 
    
    constructor(id:string, info: string,  shortcut: string, orientation_info: ORIENTATION_INFO, img_src: string, cursor_style: string, my_sidebar? : SideBar) {
        super(id, info, shortcut, orientation_info, img_src, cursor_style, my_sidebar); 
        this.trigger = () => { };
    }
    

    unselect(reset?:boolean) {
        this.dom.classList.remove("bar_side_active_item");
        this.dom.classList.remove("selected");
        
        if(reset){
            // We reset the image to its default value
            this.reset_img();
        }
    }

    /**
     * Create and insert the HTMLElement into the sidebar the item belongs.
     * Note: calls super.render() 
     * @param my_sidebar The sidebar the item belongs
     */
    render(my_sidebar: SideBar): void {
        super.render(my_sidebar);
        this.dom.classList.add("side_bar_item");
        this.img_dom.classList.add("side_bar_item_img");
        this.dom.addEventListener("mousedown", (e) => {
            const pos = new CanvasCoord(e.pageX, e.pageY);
            this.common_trigger(pos);
            this.trigger(pos);
            const canvas = document.getElementById('main') as HTMLCanvasElement;
            const ctx = canvas.getContext('2d');
            requestAnimationFrame(function () { draw(canvas, ctx, local_board.graph) });
            }
        )
    }
    abstract common_trigger(mouse_pos:CanvasCoord);


}
