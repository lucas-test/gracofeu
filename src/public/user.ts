import { view } from "./camera";
import { invertColor, shadeColor } from "./draw";
import { CanvasCoord, ServerCoord } from "./local_graph";
import { Multicolor } from "./multicolor";
import { socket } from "./socket";


export class User {
    label: string;
    multicolor: Multicolor;
    // contrast_color: string;
    // border_color:string;
    pos: ServerCoord;
    canvas_pos: CanvasCoord;

    constructor(label: string, color: string, pos?: ServerCoord) {
        this.label = label;
        this.multicolor = new Multicolor(color);
        // this.contrast_color = invertColor(color);
        // this.border_color = shadeColor(color, -60);

        
        if (typeof pos !== 'undefined') {
            this.pos = pos;
            this.canvas_pos = view.canvasCoord(this.pos);
        }
        else{
            this.pos = null;
            this.canvas_pos = null;
        }
    }

    set_pos(x: number, y: number) {
        this.pos.x = x;
        this.pos.y = y;
        this.canvas_pos = view.canvasCoord(this.pos);
    }

    set_color(color:string){
        this.multicolor.set_color(color);
        // this.contrast_color = invertColor(color);
        // this.border_color = shadeColor(color, -60);
    }

}

export let users = new Map<string, User>();

export function update_user_list_div() {
    let div = document.getElementById("user_list");
    div.innerHTML = "";
    if (users.size === 0) {
        div.style.visibility = "hidden";
        // div.style.marginLeft = "0px";
        div.style.padding = "0px";
    }
    else {
        div.style.visibility = "visible";
        div.style.padding = "2px";
        // div.style.marginLeft = "10px";
    }

    for (let u of users.values()) {
        let newDiv = document.createElement("div");
        newDiv.classList.add("user");
        newDiv.style.color = u.multicolor.contrast;
        newDiv.innerHTML = u.label.substring(0, 1);
        newDiv.style.background = u.multicolor.color;
        newDiv.style.borderColor = u.multicolor.color;
        newDiv.dataset.label = u.label;


        newDiv.onclick = function () {
            //TODO: Follow user
        }
        div.appendChild(newDiv)
    }
}


export class Self{
    label:string;
    color:string;
    id:string;
    contrast_color:string;

    constructor(){
        this.label = null;
        this.color = null;
        this.id = null;
        this.contrast_color = null;
    }

    init(id:string, label:string, color:string){
        this.color = color;
        this.label = label;
        this.id = id;
        this.contrast_color = invertColor(color);
    }

    update_label(label:string){
        this.label = label;
    }

    update_color(color:string){
        this.color = color;
        this.contrast_color = invertColor(color);
    }
}


export const self_user = new Self();


export function update_self_user_div(){
    update_self_user_color();
    update_self_user_label();
}


function update_self_user_color(){
    let div = document.getElementById('self_user_color');
    div.style.background = self_user.color;
}

function update_self_user_label(){
    let div = document.getElementById('self_user_label');
    div.textContent = self_user.label;
    div.addEventListener('keydown', function(e:KeyboardEvent)
    {   
        // console.log(e.key);
        const prevent = "!@#$%^&*()+=-[]\\\';,./{}|\":<>?";
        if(div.textContent.length > 0 && (e.key == "Escape" || e.key == "Enter")){
            div.blur();
        }
        else if(prevent.includes(e.key) || (div.textContent.length > 8 && ! ["Delete", "Backspace", "ArrowLeft", "ArrowRight"].includes(e.key))){
            e.preventDefault();
        }
    });

    div.addEventListener('focusout', function()
    {   
        socket.emit("update_self_user", div.textContent, self_user.color);
    });

}