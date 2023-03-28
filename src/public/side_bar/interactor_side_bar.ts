import { ClientGraph } from "../board/graph";
import { CanvasCoord } from "../board/vertex";
import { DOWN_TYPE, Interactor } from "../interactors/interactor";
import { ORIENTATION_INFO } from "./element_side_bar";
import { ItemSideBar } from "./item_side_bar";
import { SideBar } from "./side_bar";

export class InteractorV2 extends ItemSideBar {
    interactable_element_type: Set<DOWN_TYPE>;
    
    mousedown: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: ClientGraph, e: CanvasCoord) => void;
    mousemove: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: ClientGraph, e: CanvasCoord) => boolean;
    mouseup: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: ClientGraph, e: CanvasCoord) => void;
    onleave: () => void;
    draw: (ctx: CanvasRenderingContext2D) => void;

    constructor(id:string, info: string, shortcut: string, orientation_info: ORIENTATION_INFO, img_src: string, cursor_style: string,interactable_element_type: Set<DOWN_TYPE>, my_sidebar? : SideBar)
    {
        super(id, info, shortcut, orientation_info, img_src, cursor_style, my_sidebar);
        this.interactable_element_type = interactable_element_type;
        this.cursor_style = cursor_style;
        this.onleave = () => {};
        this.draw = () => {};
        this.mousedown = () => {};
        this.mousemove = () => {return false;};
        this.mouseup= () => {};
    }

    render(my_sidebar: SideBar): void {
        super.render(my_sidebar);
        this.dom.classList.add("interactor");
    }

    common_trigger(){
        document.querySelectorAll(".interactor").forEach(interactor => {
            interactor.classList.remove("selected");
        });
        this.dom.classList.add("selected");
        console.log(this.id);
    }

}