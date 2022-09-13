import { CanvasCoord } from "../board/coord";
import { Graph } from "../board/graph";
import { create_popup } from "../popup";
import { socket } from "../socket";
import { GraphGenerator } from "./generator";
import { generators_available } from "./some_generators";

// graph clipboard
export let graph_clipboard: Graph = null;
export let mouse_position_at_generation: CanvasCoord = null;
let last_generator: GraphGenerator = null;



export function setup_generators_div() {
    const main_div = create_popup("generators_div", "Generators");

    const generators_list = document.createElement("div");
    generators_list.id = "generators_list";
    main_div.appendChild(generators_list);
    const generators_list_title = document.createElement("h2");
    generators_list_title.textContent = "Generators";
    generators_list.appendChild(generators_list_title);

    const generator_activated_div = document.createElement("div");
    generator_activated_div.id = "generator_configuration";
    main_div.appendChild(generator_activated_div);

    // create list of generators
    for (const gen of generators_available) {
        const text = document.createElement("div");
        text.classList.add("generator_item");
        text.innerHTML = gen.name;
        text.onclick = () => {
            activate_generator_div(gen);
        }
        generators_list.appendChild(text)
    }

    // TODO recherche dans la liste
}

function turn_off_generators_div() {
    document.getElementById("generators_div").style.display = "none";
}

export function turn_on_generators_div() {
    document.getElementById("generators_div").style.display = "flex";
}

function activate_generator_div(gen: GraphGenerator) {
    const div = document.getElementById("generator_configuration");
    div.innerHTML = ""; // TODO clear better ??

    const title = document.createElement("h2");
    title.innerText = gen.name;
    div.appendChild(title);

    for (const attribute of gen.attributes) {
        const attribute_div = document.createElement("div");
        const label = document.createElement("label");
        label.innerText = attribute.name + ": ";
        attribute_div.appendChild(label);
        attribute_div.appendChild(attribute.create_input_element());
        div.appendChild(attribute_div);
    }

    const generate_button = document.createElement("button");
    generate_button.textContent = "generate";
    generate_button.onclick = (e) => {
        for( const attribute of gen.attributes.values() ){
            if( attribute.input.classList.contains("invalid")){
                return;
            }
        }
        mouse_position_at_generation = new CanvasCoord(e.pageX, e.pageY);
        graph_clipboard = gen.generate();
        last_generator = gen;
        turn_off_generators_div();
        document.body.style.cursor = "grab";
    }
    div.appendChild(generate_button);
}


export function paste_generated_graph() {
    socket.emit("paste_graph", [...graph_clipboard.vertices.entries()], [...graph_clipboard.links.entries()]);
    graph_clipboard = null;
    document.body.style.cursor = "pointer";
}

export function regenerate_graph(e: MouseEvent){
    if ( last_generator !== null){
        mouse_position_at_generation = new CanvasCoord(e.pageX, e.pageY);
        graph_clipboard = last_generator.generate();
    }
}