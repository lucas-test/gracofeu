import { SideBar } from "./side_bar";

export enum ORIENTATION_SIDE_BAR{
    VERTICAL = 1,
    HORIZONTAL = 2
}


export abstract class ElementSideBar{
    info: string; // The information of the tooltip // TODO
    shortcut: string; 
    img_src: string; // The default src (do not change)
    img_dom : HTMLImageElement; 
    cursor_style: string;
    id: string; 
    dom : HTMLElement;
    my_sidebar: SideBar; // The sidebar the element belongs


    constructor(id:string, info: string, shortcut: string, img_src: string, cursor_style: string,  sidebar? : SideBar) {
        this.info = info;
        this.shortcut = shortcut;
        this.img_src = img_src;
        this.cursor_style = cursor_style;
        this.id = id;
        if(sidebar !== undefined){
            this.my_sidebar = sidebar;
            this.setup_element(sidebar);
        }
        else{
            this.my_sidebar = null;
        }
    }

    /**
     * Change the src of the img tag. 
     * NOTE: it does NOT change the parameter img_src that needs to stay in case we have to reset the img
     * @param src path of the src image
     * @returns true iff the change was successful
     */
    update_img(src :string):boolean{
        try {
            this.img_dom.src = src; 
            return true;
        } catch (error) {
            console.error("Image not loaded yet when you tried to update it. Dom is null.", error);
            return false;
        }
    }


    /**
     *  Reset the img to its original value (the one stored in img_src)
     * @returns true iff the image was successfully reset
     */
    reset_img():boolean{
        try {
            this.img_dom.src = this.img_src; 
            return true;
        } catch (error) {
            console.error("Image not loaded yet when you tried to update it. Dom is null.", error);
            return false;
        }
    }

    /**
     * Create and insert the HTMLElements of the element into the sidebar given in parameter
     * @param my_sidebar The sidebar the element belongs
     */
    setup_element(my_sidebar:SideBar){
        this.my_sidebar = my_sidebar;
        this.dom = document.getElementById(this.id);
        if(this.dom != null){
            console.error(`Failing create Item ${this.id}. The id already exists.`);
            this.dom.innerHTML = "";
        }
        else{
            this.dom = document.createElement("div");
            this.dom.id = this.id;
        }
        this.dom.style.cursor = this.cursor_style;
        this.dom.classList.add("side_bar_element");

        this.img_dom = document.createElement("img");
        this.img_dom.src = this.img_src;
        this.img_dom.id = this.id+'_img';
        this.img_dom.classList.add("side_bar_element_img");
        
        this.my_sidebar.dom.appendChild(this.dom);
        this.dom.appendChild(this.img_dom);

        // TODO: Remove -- just for debugging
        this.img_dom.onmouseover = () => {
            console.log(this.id);
        }
    }

    setup_specifics(my_sidebar: SideBar){};
    
    unselect(b:boolean) {
        throw new Error("Method not implemented.");
    }
}