import { ClientBoard } from "../board/board";
import { View } from "../board/camera";
import { CanvasCoord } from "../board/vertex";
import { set_clipboard } from "../clipboard";
import { create_popup } from "../popup";
import { GraphGenerator } from "./generator";
import { generators_available } from "./some_generators";


let last_generator: GraphGenerator = null;



export function setup_generators_div(canvas: HTMLCanvasElement, board: ClientBoard) {
    const main_div = create_popup("generators_div", "Generators");
    const popup_content = document.getElementById("generators_div_content");
    popup_content.style.display = "flex";

    const generators_list = document.createElement("div");
    generators_list.id = "generators_list";
    popup_content.appendChild(generators_list);
    
    const search_input = document.createElement("input");
    search_input.classList.add("search_filter");
    search_input.type = "text";
    search_input.id = "generator_search_input";
    search_input.onkeyup = handle_search_onkeyup;
    search_input.placeholder = "Search for names..";
    generators_list.appendChild(search_input);
    

    const generator_activated_div = document.createElement("div");
    generator_activated_div.id = "generator_configuration";
    popup_content.appendChild(generator_activated_div);

    // create list of generators
    for (const gen of generators_available) {
        const text = document.createElement("div");
        text.classList.add("generator_item");
        text.innerHTML = gen.name;
        text.onclick = () => {
            activate_generator_div(canvas, gen, board);
        }
        generators_list.appendChild(text)
    }
}

function turn_off_generators_div() {
    document.getElementById("generators_div").style.display = "none";
}

export function turn_on_generators_div() {
    document.getElementById("generators_div").style.display = "block";
}

function activate_generator_div(canvas: HTMLCanvasElement, gen: GraphGenerator, board: ClientBoard) {
    const div = document.getElementById("generator_configuration");
    div.innerHTML = ""; // TODO clear better ??

    const title = document.createElement("h2");
    title.innerText = gen.name;
    div.appendChild(title);

    for (const attribute of gen.attributes) {
        attribute.reset_inputs(board);
        const attribute_div = document.createElement("div");
        const label = document.createElement("label");
        label.innerText = attribute.name + ": ";
        attribute_div.appendChild(label);
        attribute_div.appendChild(attribute.div);
        div.appendChild(attribute_div);
    }

    const generate_button = document.createElement("button");
    generate_button.textContent = "generate";
    generate_button.onclick = (e) => {
        for( const attribute of gen.attributes.values() ){
            if( attribute.div.classList.contains("invalid")){
                return;
            }
        }
        set_clipboard(gen.generate(new CanvasCoord(e.pageX, e.pageY), board.view), new CanvasCoord(e.pageX, e.pageY) , true, canvas);
        last_generator = gen;
        turn_off_generators_div();
    }
    div.appendChild(generate_button);
}




export function regenerate_graph(e: MouseEvent, canvas: HTMLCanvasElement, view: View){
    if ( last_generator !== null){
        set_clipboard(last_generator.generate(new CanvasCoord(e.pageX, e.pageY), view), new CanvasCoord(e.pageX, e.pageY), true, canvas);
    }
}


function handle_search_onkeyup() {
    const input = <HTMLInputElement>document.getElementById('generator_search_input');
    const filter = input.value.toUpperCase();
    const div_content = document.getElementById("generators_div_content");
    const param_list = <HTMLCollectionOf<HTMLDivElement>>div_content.getElementsByClassName('generator_item');

    for (let i = 0; i < param_list.length; i++) {
        const txtValue = param_list[i].innerHTML;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            param_list[i].style.display = "";
        } else {
            param_list[i].style.display = "none";
        }
    }
}