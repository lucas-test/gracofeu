import { draw, resizeCanvas } from "./draw";
import { interactor_edge } from "./interactors/edge_interactor";
import { setup_interactions, select_interactor, setup_interactors_div } from "./interactors/interactor_manager";
import { local_graph } from "./local_graph";
import { params_available_turn_off_div, params_available_turn_on_div, update_params_available_div } from "./parametors/div_parametor";
import { setup_parametors_available } from "./parametors/parametor_manager";
import { setup_socket, socket } from "./socket";



socket.emit("message", "hello from new client");


function setup() {

    let canvas = document.getElementById('main') as HTMLCanvasElement;
    let ctx = canvas.getContext('2d');


    setup_socket(canvas, ctx, local_graph);

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    window.addEventListener('resize', function () { resizeCanvas(canvas, ctx, local_graph) }, false);
    document.addEventListener('contextmenu', event => event.preventDefault());
    setup_interactions(canvas, ctx, local_graph);
    setup_interactors_div();
    select_interactor(interactor_edge);


    setup_parametors_available();
    update_params_available_div(canvas, ctx, local_graph);

    let params_loaded_button = document.getElementById("params_loaded_button");
    params_loaded_button?.addEventListener('click', () => {
        params_available_turn_on_div();
    });

    let params_available_button = document.getElementById("params_available_button");
    params_available_button?.addEventListener('click', () => {
        params_available_turn_off_div();
    });

    let share_link_div = document.getElementById("share_link");
    share_link_div?.addEventListener('click', () => {
        socket.emit("get_room_id", (room_id: string) => {
            navigator.clipboard.writeText(location.origin + "/?room_id=" + room_id)
                .then(() => {
                    const _sav = share_link_div.innerHTML;
                    share_link_div.innerHTML = "Copied!";
                    setTimeout(function () {
                        share_link_div.innerHTML = _sav;
                    }, 1000);
                });
        });
    });

    const save_file_div = document.getElementById("save_file");
    save_file_div?.addEventListener('click', () => {
        socket.emit("get_json", (response: string) => {
            var a = document.createElement("a");
            a.href = window.URL.createObjectURL(new Blob([response], { type: "text/plain" }));
            a.download = "file.gco";
            a.click();
        })
    });

    const load_file_div = document.getElementById('load_file');
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
    load_file_div.appendChild(file_input);
    load_file_div?.addEventListener('click', () => {
        file_input.style.display = "inline";
    });


    draw(canvas, ctx, local_graph);
}

setup()


