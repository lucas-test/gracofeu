import { View } from "../board/camera";
import { create_popup } from "../popup";
import { local_board } from "../setup";
import { socket } from "../socket";
import { modifyer_into_tournament } from "./implementations/into_tournament";
import { GraphModifyer } from "./modifyer";

// --- Modifyers available ---
let modifyers_available = new Array<GraphModifyer>();
modifyers_available.push(modifyer_into_tournament)




export function setup_modifyers_div(canvas: HTMLCanvasElement, view: View) {
    const main_div = create_popup("modifyers_div", "Modifyers");
    const popup_content = document.getElementById("modifyers_div_content");
    popup_content.style.display = "flex";
    popup_content.classList.add("scrolling_y","non_scrolling_bar");

    const modifyers_list = document.createElement("div");
    modifyers_list.id = "modifyers_list";
    popup_content.appendChild(modifyers_list);
    
    const search_input = document.createElement("input");
    search_input.classList.add("search_filter");
    search_input.type = "text";
    search_input.id = "modifyer_search_input";
    search_input.onkeyup = handle_search_onkeyup;
    search_input.placeholder = "Search for names..";
    modifyers_list.appendChild(search_input);
    

    const modifyer_activated_div = document.createElement("div");
    modifyer_activated_div.id = "modifyer_configuration";
    popup_content.appendChild(modifyer_activated_div);

    // create list of modifyers
    for (const mod of modifyers_available) {
        const text = document.createElement("div");
        text.classList.add("modifyer_item");
        text.innerHTML = mod.name;
        text.onclick = () => {
            activate_modifyer_div(canvas, mod, view);
        }
        modifyers_list.appendChild(text)
    }
}

function turn_off_modifyers_div() {
    document.getElementById("modifyers_div").style.display = "none";
}

export function turn_on_modifyers_div() {
    document.getElementById("modifyers_div").style.display = "block";
}

function activate_modifyer_div(canvas: HTMLCanvasElement, mod: GraphModifyer, view: View) {
    const div = document.getElementById("modifyer_configuration");
    div.innerHTML = ""; // TODO clear better ??

    const title = document.createElement("h2");
    title.innerText = mod.name;
    div.appendChild(title);

    for (const attribute of mod.attributes) {
        attribute.reset_inputs(local_board);
        const attribute_div = document.createElement("div");
        const label = document.createElement("label");
        label.innerText = attribute.name + ": ";
        attribute_div.appendChild(label);
        attribute_div.appendChild(attribute.div);
        div.appendChild(attribute_div);
    }

    const modify_button = document.createElement("button");
    modify_button.textContent = "modify";
    modify_button.onclick = (e) => {
        for( const attribute of mod.attributes.values() ){
            if( attribute.div.classList.contains("invalid")){
                return;
            }
        }
        // mod.modify();
        const attributes_data = new Array();
        for (const attribute of mod.attributes){
            attributes_data.push(attribute.value);
        }
        socket.emit("apply_modifyer", mod.name, attributes_data );
        turn_off_modifyers_div();
    }
    div.appendChild(modify_button);
}



function handle_search_onkeyup() {
    const input = <HTMLInputElement>document.getElementById('modifyer_search_input');
    const filter = input.value.toUpperCase();
    const div_content = document.getElementById("modifyers_div_content");
    const param_list = <HTMLCollectionOf<HTMLDivElement>>div_content.getElementsByClassName('modifyer_item');

    for (let i = 0; i < param_list.length; i++) {
        const txtValue = param_list[i].innerHTML;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            param_list[i].style.display = "";
        } else {
            param_list[i].style.display = "none";
        }
    }
}