export enum ORIENTATION_MENU{
    VERTICAL = 1,
    HORIZONTAL = 2
}


export abstract class ElementMenu{
    info: string;
    shortcut: string;
    img_src: string;
    img_dom : HTMLImageElement;
    cursor_style: string;
    id: string;
    dom : HTMLElement;
    parent_dom : HTMLElement;


    constructor(info: string, shortcut: string, img_src: string, cursor_style: string, id:string, parent_dom : HTMLElement) {
        this.info = info;
        this.shortcut = shortcut;
        this.img_src = img_src;
        this.cursor_style = cursor_style;
        this.id = id;
        this.parent_dom = parent_dom;
        this.img_dom = null; 
    }

    update_img(src :string):boolean{
        this.img_src = src;
        try {
            this.img_dom.src = src; 
            return true;
        } catch (error) {
            console.error("Image not loaded yet when you tried to update it. Dom is null.", error);
            return false;
        }
    }

    setup(HTMLElement){};

}