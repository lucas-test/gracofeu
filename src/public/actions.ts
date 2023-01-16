import { INDEX_TYPE } from "./board/camera";
import { COLOR_BACKGROUND, draw, toggle_dark_mode } from "./draw";
import { ClientGraph } from "./board/graph";
import { socket } from "./socket";
import { TikZ_create_file_data } from "./tikz";
import { local_board } from "./setup";
import BASIC_COLORS from "./basic_colors.json";
import { turn_on_generators_div } from "./generators/dom";
import { turn_on_modifyers_div } from "./modifyers/dom";

export class Action {
    name: string;
    info: string;
    img_src: string;
    subactions: Array<Action>;
    shortcut: string;
    trigger: () => void;

    constructor(name: string, info: string, img_src: string, shortcut: string) {
        this.name = name;
        this.info = info;
        this.img_src = img_src;
        this.subactions = new Array<Action>();
        this.shortcut = shortcut;
        this.trigger = () => { };
    }
}

let generator_action = new Action("generator", "Show graph generators", "generator.svg", "");

generator_action.trigger = () => {
    turn_on_generators_div();
}

// ----
let modifyer_action = new Action("modifyer", "Show graph modifyers", "modifyer.svg", "");
modifyer_action.trigger = () => {
    turn_on_modifyers_div();
}


let dark_mode_action = new Action("dark_mode", "Toggle dark mode", "dark_mode.svg", "");

dark_mode_action.trigger = () =>
{
    if(local_board.view.dark_mode){
        toggle_dark_mode(false);
        local_board.view.dark_mode = false;
        for( const name in BASIC_COLORS){
            document.getElementById("color_choice_" + name).style.backgroundColor = BASIC_COLORS[name].light;
        } 
    }
    else{
        toggle_dark_mode(true);
        local_board.view.dark_mode = true;
        for( const name in BASIC_COLORS){
            document.getElementById("color_choice_" + name).style.backgroundColor = BASIC_COLORS[name].dark;
        } 
    }

}


let share_action = new Action("share_link", "Share url", "share.svg", "");

share_action.trigger = () => {
    socket.emit("get_room_id", (room_id: string) => {
        navigator.clipboard.writeText(location.origin + "/?room_id=" + room_id)
            .then(() => {
                const subactions_div = document.getElementById(load_file_action.name + "_subactions");
                subactions_div.classList.add("subaction_info");
                subactions_div.innerHTML = "Copied!</br>" + location.origin + "/?room_id=" + room_id;
                subactions_div.style.display = "block"
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



const save_tikz_file = new Action("export_tex", "Export to .tex", "export_tex.svg", "");
save_tikz_file.trigger = () => {
    const tikz_data = TikZ_create_file_data(local_board.graph);
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([tikz_data], { type: "text/plain" }));
    a.download = "file.tex";
    a.click();
}

const save_gco_file = new Action("export_gco", "Export to .gco", "export_gco.svg", "");
save_gco_file.trigger = () => {
    socket.emit("get_json", (response: string) => {
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(new Blob([response], { type: "text/plain" }));
        a.download = "file.gco";
        a.click();
    })
}


const save_file_action = new Action("save_file", "Export to file", "export.svg", "");
save_file_action.subactions.push(save_tikz_file, save_gco_file);




let load_file_action = new Action("load_file", "Load file", "import.svg", "");



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


let change_to_none_index = new Action("index_type_none", "Remove all labels", "index_none.svg", "");
change_to_none_index.trigger = () => {
    local_board.view.index_type = INDEX_TYPE.NONE;
    local_board.graph.compute_vertices_index_string(local_board.view);
}

let change_to_number_stable_index = new Action("index_type_number_stable", "[Stable numerical] Set automatically labels to numeric and maintain labels after vertices deletions.", "index_number_stable.svg", "");
change_to_number_stable_index.trigger = () => {
    local_board.view.index_type = INDEX_TYPE.NUMBER_STABLE;
    local_board.graph.compute_vertices_index_string(local_board.view);
}

let change_to_number_unstable_index = new Action("index_type_number_unstable", "[Unstable numerical] Set automatically labels to numeric. Labels will be recomputed after vertices deletions so that there are between 0 and n-1.", "index_number_unstable.svg", "");
change_to_number_unstable_index.trigger = () => {
    local_board.view.index_type = INDEX_TYPE.NUMBER_UNSTABLE;
    local_board.graph.compute_vertices_index_string(local_board.view);
}

let change_to_alpha_stable_index = new Action("index_type_alpha_stable", "[Stable alphabetical] Set automatically labels to alphabetic and maintain labels after vertices deletions.", "index_alpha_stable.svg", "");
change_to_alpha_stable_index.trigger = () => {
    local_board.view.index_type = INDEX_TYPE.ALPHA_STABLE;
    local_board.graph.compute_vertices_index_string(local_board.view);
}

let change_to_alpha_unstable_index = new Action("index_type_number_stable", "[Unstable alphabetic] Set automatically labels to alphabetic. Labels will be recomputed after vertices deletions so that there are between a and z.", "index_alpha_unstable.svg", "");
change_to_alpha_unstable_index.trigger = () => {
    local_board.view.index_type = INDEX_TYPE.ALPHA_UNSTABLE;
    local_board.graph.compute_vertices_index_string(local_board.view);
}


let index_action = new Action("index_type", "Automatic numerotation", "index.svg", "");

index_action.subactions.push(change_to_none_index, change_to_number_stable_index, change_to_number_unstable_index, change_to_alpha_stable_index, change_to_alpha_unstable_index);


let align_action = new Action("align_mode", "Automatic alignement", "align.svg", "");
align_action.trigger = () => {
    local_board.view.is_aligning = !local_board.view.is_aligning;
    const align_div = document.getElementById("align_mode");
    if (local_board.view.is_aligning) {
        align_div.classList.add("action_activated");
    }
    else {
        align_div.classList.remove("action_activated");
    }
}



let grid_action = new Action("grid_mode", "Show Layout", "grid.svg", "l");
grid_action.trigger = () => {
    local_board.view.grid_show = !local_board.view.grid_show;
    const grid_div = document.getElementById("grid_mode");
    if (local_board.view.grid_show) {
        grid_div.classList.add("action_activated");
    }
    else {
        grid_div.classList.remove("action_activated");
    }
}



export let actions_available = new Array<Action>();
actions_available.push(generator_action, modifyer_action, grid_action, align_action, index_action, dark_mode_action, share_action, save_file_action, load_file_action)

export function select_action(action: Action, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: ClientGraph){
    document.getElementById(action.name + "_subactions").style.display = "block";
    action.trigger();
    requestAnimationFrame(function () { draw(canvas, ctx, g) });
}


export function setup_actions_div(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: ClientGraph) {
    const actions_div = document.getElementById("actions");
    for (const action of actions_available) {
        const newDiv = document.createElement("div");
        newDiv.classList.add("action");
        newDiv.id = action.name;

        // SUBACTIONS
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
        newDiv.innerHTML = '<img src="img/actions/' + action.img_src + '" width="30px" />';
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

            add_recap_div(subaction, new_subaction_div, 130);
        }

        add_recap_div(action, newDiv, 70);
       


        // APPEND TO DOCUMENT
        document.body.appendChild(new_subactions_div);


    }   
}

// RECAP
function add_recap_div(action: Action, newDiv: HTMLDivElement, top: number){
     let div_recap = document.createElement("div");
     div_recap.classList.add("interactor_recap");
     if ( action.shortcut != ""){
         div_recap.innerHTML = action.info + " <span class='shortcut'>" + action.shortcut + "</span>";
     }else {
         div_recap.innerHTML = action.info;
     }
     document.body.appendChild(div_recap);

     newDiv.onmouseenter = function () {
         var offsets = newDiv.getBoundingClientRect();
         div_recap.style.display = "block";
         div_recap.style.left = String(offsets.left) + "px"; 
         div_recap.style.top = String(top) + "px";
     }

     newDiv.onmouseleave = function () {
         div_recap.style.display = "none";
     }
}