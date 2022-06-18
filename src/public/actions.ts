import { INDEX_TYPE, view } from "./camera";
import { draw } from "./draw";
import { Graph, local_graph } from "./local_graph";
import { socket } from "./socket";

export class Action {
    name: string;
    img_src: string;
    subactions: Array<Action>;
    trigger: () => void;

    constructor(name: string, img_src: string) {
        this.name = name;
        this.img_src = img_src;
        this.subactions = new Array<Action>();
        this.trigger = () => { };
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



load_file_action.trigger = () => {
    const subactions_div = document.getElementById(load_file_action.name + "_subactions");
    if (subactions_div) {
        const file_input: HTMLInputElement = document.createElement("input");
        file_input.type = "file";
        file_input.style.display = "none";
        file_input.onchange = function () {
            let input = file_input.files[0];
            subactions_div.style.display = "none";
            let reader = new FileReader();
            reader.readAsText(input);
            reader.onload = function () {
                socket.emit('load_json', reader.result);
            };
        }
        subactions_div.appendChild(file_input);
        file_input.style.display = "inline-block";
    }
}


let change_to_none_index = new Action("index_type_none", "index_none.svg");
change_to_none_index.trigger = () => {
    view.index_type = INDEX_TYPE.NONE;
    local_graph.compute_vertices_index_string();
}

let change_to_number_stable_index = new Action("index_type_number_stable", "index_number_stable.svg");
change_to_number_stable_index.trigger = () => {
    view.index_type = INDEX_TYPE.NUMBER_STABLE;
    local_graph.compute_vertices_index_string();
}

let change_to_number_unstable_index = new Action("index_type_number_stable", "index_number_unstable.svg");
change_to_number_unstable_index.trigger = () => {
    view.index_type = INDEX_TYPE.NUMBER_UNSTABLE;
    local_graph.compute_vertices_index_string();
}

let change_to_alpha_stable_index = new Action("index_type_number_stable", "index_alpha_stable.svg");
change_to_alpha_stable_index.trigger = () => {
    view.index_type = INDEX_TYPE.ALPHA_STABLE;
    local_graph.compute_vertices_index_string();
}

let change_to_alpha_unstable_index = new Action("index_type_number_stable", "index_alpha_unstable.svg");
change_to_alpha_unstable_index.trigger = () => {
    view.index_type = INDEX_TYPE.ALPHA_UNSTABLE;
    local_graph.compute_vertices_index_string();
}


let index_action = new Action("index_type", "index.svg");

index_action.subactions.push(change_to_none_index, change_to_number_stable_index, change_to_number_unstable_index, change_to_alpha_stable_index, change_to_alpha_unstable_index);





let actions_available = new Array<Action>();
actions_available.push(index_action, share_action, save_file_action, load_file_action)


export function setup_actions_div(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    const actions_div = document.getElementById("actions");
    for (const action of actions_available) {
        const newDiv = document.createElement("div");
        newDiv.classList.add("action");
        newDiv.id = action.name;

        const new_subactions_div = document.createElement("div");
        new_subactions_div.classList.add("subaction_container");
        new_subactions_div.id = action.name + "_subactions";
        new_subactions_div.style.display = "none";
        new_subactions_div.addEventListener("mouseleave", (event) => {
            const target = event.target as HTMLDivElement;
            target.style.display = "none";
        })

        newDiv.onclick = function () {
            new_subactions_div.style.display = "block";
            action.trigger();
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        };
        newDiv.innerHTML = '<img src="img/actions/' + action.img_src + '" width="27px" />';
        actions_div.appendChild(newDiv);



        for (const subaction of action.subactions) {
            const new_subaction_div = document.createElement("div");
            new_subaction_div.classList.add("subaction");
            new_subaction_div.id = subaction.name;
            new_subaction_div.innerHTML = '<img src="img/actions/' + subaction.img_src + '" width="27px" />';
            new_subaction_div.onclick = function () {
                new_subactions_div.style.display = "none";
                subaction.trigger();
                requestAnimationFrame(function () { draw(canvas, ctx, g) });
            };
            new_subactions_div.appendChild(new_subaction_div);
        }

        document.body.appendChild(new_subactions_div);


    }
}