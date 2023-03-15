import { ClientGraph } from "../board/graph";
import { CanvasCoord } from "../board/vertex";
import { ElementSideBar, ORIENTATION_SIDE_BAR } from "./element_side_bar";
import { FolderSideBar } from "./folder_side_bar";



export class SideBar {
    orientation: ORIENTATION_SIDE_BAR; // Vertical or Horizontal
    elements : Array<ElementSideBar>; // Elements contained in the sidebar 
    id : string;
    dom : HTMLElement;
    active : boolean; // True iff the sidebar is shown

    /**
     * 
     * @param id id of the HTML (must be unique)
     * @param orientation Vertical or Horizontal
     * @param active true iff the sidebar is shown. False by default.
     */
    constructor(id: string, orientation:ORIENTATION_SIDE_BAR, active?:boolean){
        if(active !== undefined){
            this.active = false;
        }
        else{
            this.active = active;
        }

        this.id = id;
        this.orientation = orientation;
        this.dom = document.getElementById(this.id);
        this.elements = new Array<ElementSideBar>();
        if(this.dom != null){
            console.error(`Failing create Menu ${this.id}. The id already exists.`);
            this.dom.innerHTML = "";
        }
        else{
            this.dom = document.createElement("div");
            this.dom.id = this.id;
        }
        this.dom.classList.add("side_bar");

        switch(orientation){
            case(ORIENTATION_SIDE_BAR.HORIZONTAL):
                this.dom.classList.add("side_bar_horizontal");
                break;
            case(ORIENTATION_SIDE_BAR.VERTICAL):
                this.dom.classList.add("side_bar_vertical");
                break;
            default:
                break;
        }

        
    }  
    


    /**
     * Add the elements, create their HTML and insert them in the HTML of the sidebar
     * @param args Arbitrary list of elements.
     */
    add_elements(...args: ElementSideBar[]){
        for (var i = 0; i < args.length; i++) {
            this.elements.push(args[i]);

            // We check if the element is not already in the sidebar
            if(args[i].my_sidebar != this){
                args[i].setup_specifics(this);
            }
        }

    }
    
    /**
     * Close recursively all the folders the sidebar may contain
     * @param reset boolean set to true if we want to reset the default image. Set at true by default.
     */
    unselect_all_elements(reset?:boolean){
        for(const element of this.elements){
            element.unselect(reset);
            // element.reset_img();
        }
    }

    /**
     *  Close recursively all the folders the sidebar may contain but the one in parameter
     * @param folder the folder to keep opened
     * @param reset boolean set to true if we want to reset the default image. Set at true by default.
     */
    unselect_all_other_elements(folder:FolderSideBar, reset?:boolean){
        for(const element of this.elements){
            if(element !== folder){
                element.unselect(reset);
            }
            // element.reset_img();
        }
    }


    hide(){
        this.dom.style.display = "none";
        // this.unselect_all_elements();
        this.active = false;
    }

    show()
    {
        this.dom.style.display = "flex";
        this.active = true;
    }

    /**
     * 
     * @returns the new current status of the sidebar
     */
    toggle():boolean{
        if(this.active){
            this.hide();
        }
        else{
            this.show();
        }
        console.log("Toggle ", this.id, this.active)
        return this.active;
    }

}

