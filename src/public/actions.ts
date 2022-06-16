import { socket } from "./socket";

export class Action {
    name: string;
    img_src: string;
    trigger: () => void;

    constructor(name, img_src) {
        this.name = name;
        this.img_src = img_src;
    }
}



let share_action = new Action("share_link", "share.svg");

share_action.trigger = () => {
    socket.emit("get_room_id", (room_id: string) => {
        navigator.clipboard.writeText(location.origin + "/?room_id=" + room_id)
            .then(() => {
                // TODO : update to new div
                /*
                const _sav = share_link_div.innerHTML;
                share_link_div.innerHTML = "Copied!";
                setTimeout(function () {
                    share_link_di
                    v.innerHTML = _sav;
                }, 1000);
                */
            });
    });
}

let save_file_action = new Action("save_file", "export.svg");

save_file_action.trigger = () => {
    socket.emit("get_json", (response: string) => {
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(new Blob([response], { type: "text/plain" }));
        a.download = "file.gco";
        a.click();
    })
}

let load_file_action = new Action("load_file", "import.svg");

const file_input: HTMLInputElement = document.createElement("input");
file_input.type = "file";
file_input.style.display = "none";
file_input.onchange = function () {
    let input = file_input.files[0];
    file_input.style.display = "none";
    let reader = new FileReader();
    reader.readAsText(input);
    reader.onload = function () {
        socket.emit('load_json', reader.result);
    };
}

load_file_action.trigger = () => {
    const actions_div = document.getElementById("actions");
    if (actions_div) {
        actions_div.appendChild(file_input);
        file_input.style.display = "inline-block";
    }
}






let actions_available = new Array<Action>();
actions_available.push(share_action, save_file_action, load_file_action)


export function setup_actions_div() {
    let actions_div = document.getElementById("actions");
    for (let action of actions_available) {
        let newDiv = document.createElement("div");
        newDiv.classList.add("action");
        newDiv.id = action.name;
        newDiv.onclick = function () {
            action.trigger();
        };
        newDiv.innerHTML = '<img src="img/actions/' + action.img_src + '" width="27px" />';
        actions_div.appendChild(newDiv);
    }
}