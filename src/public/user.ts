import { Coord } from "gramoloss";
import { View } from "./board/camera";
import { CanvasCoord } from "./board/vertex";
import { COLOR_BACKGROUND} from "./draw";
import { Multicolor } from "./multicolor";
import { local_board } from "./setup";
import { socket } from "./socket";


export class User {
    id: string;
    label: string;
    multicolor: Multicolor;
    pos: Coord;
    canvas_pos: CanvasCoord;

    constructor(id: string, label: string, color: string, view: View, pos?: Coord) {
        this.id = id;
        this.label = label;
        this.multicolor = new Multicolor(color);
        
        if (typeof pos !== 'undefined') {
            this.pos = pos;
            this.canvas_pos = view.create_canvas_coord(this.pos);
        }
        else{
            this.pos = null;
            this.canvas_pos = null;
        }
    }

    set_pos(x: number, y: number, view: View) {
        this.pos.x = x;
        this.pos.y = y;
        this.canvas_pos = view.create_canvas_coord(this.pos);
    }

    set_color(color:string){
        this.multicolor.set_color(color);
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
        newDiv.title = "Click to follow " + u.label;
        newDiv.style.background = u.multicolor.color;
        newDiv.style.borderColor = u.multicolor.color;
        newDiv.dataset.label = u.label;

        newDiv.onclick = function () {
            if(local_board.view.following === u.id){
                self_user.unfollow(u.id);
            }
            else{
                self_user.follow(u.id);
            }
        }
        div.appendChild(newDiv);
    }
}


export function update_users_canvas_pos(view: View) {
    for (const user of users.values()){
        user.canvas_pos = view.create_canvas_coord(user.pos);
    }
}

export class Self{
    label:string;
    multicolor:Multicolor;
    id:string;
    // contrast_color:string;

    constructor(){
        this.label = null;
        this.multicolor = null;
        this.id = null;
        // this.contrast_color = null;
    }

    init(id:string, label:string, color:string){
        this.multicolor = new Multicolor(color);
        this.label = label;
        this.id = id;
        // this.contrast_color = invertColor(color);
    }

    update_label(label:string){
        this.label = label;
    }

    set_color(color:string){
        this.multicolor.set_color(color);
        // this.contrast_color = invertColor(color);
    }


    follow(id:string){
        if(users.has(id)){
            const borderDIV = document.getElementById("border");
            const u = users.get(id);
            local_board.view.following = id;
            borderDIV.style.borderColor = u.multicolor.color;
            socket.emit("follow", id);
        }
        else{
            local_board.view.following = null;
        }
    }

    unfollow(id:string){
        const borderDIV = document.getElementById("border");
        local_board.view.following = null;
        borderDIV.style.borderColor = COLOR_BACKGROUND;
        socket.emit("unfollow", id);
    }
}


export const self_user = new Self();


export function update_self_user_div(){
    update_self_user_color();
    update_self_user_label();
}


function update_self_user_color(){
    let div = document.getElementById('self_user_color');
    div.style.background = self_user.multicolor.color;
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
        socket.emit("update_self_user", div.textContent, self_user.multicolor.color);
    });

}