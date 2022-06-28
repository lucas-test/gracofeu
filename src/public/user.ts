import e from "express";
import { invertColor, shadeColor } from "./draw";
import { ServerCoord } from "./local_graph";


export class User {
    label: string;
    color: string;
    pos: ServerCoord;

    constructor(label: string, color: string, pos: ServerCoord) {
        this.label = label;
        this.color = color;
        this.pos = pos;
    }

}

export let users = new Map<string, User>();

export function update_user_list_div() {
    let div = document.getElementById("user_list");
    div.innerHTML = "";
    if(users.size === 0){
        div.style.visibility="hidden";
    }
    else{
        div.style.visibility="visible";
    }

    for (let u of users.values()) {
        let newDiv = document.createElement("div");
        newDiv.classList.add("user");
        newDiv.style.color = invertColor(u.color);
        newDiv.innerHTML = u.label.substring(0,1);
        newDiv.style.background = u.color;
        newDiv.style.borderColor = shadeColor(u.color, -60);
        newDiv.dataset.label = u.label;


        newDiv.onclick = function () {
            //TODO: Follow user
         }
        div.appendChild(newDiv)
    }
}
