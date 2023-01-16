import { setup_actions_div } from "./actions";
import { draw, resizeCanvas } from "./draw";
import { interactor_edge } from "./interactors/edge_interactor";
import { setup_interactions, select_interactor, setup_interactors_div } from "./interactors/interactor_manager";
import { params_available_turn_off_div, params_available_turn_on_div, update_params_available_div } from "./parametors/div_parametor";
import { setup_parametors_available } from "./parametors/parametor_manager";
import { setup_socket, socket } from "./socket";
import { setup_generators_div } from "./generators/dom";
import { ClientBoard } from "./board/board";
import { setup_modifyers_div } from "./modifyers/dom";


export const local_board = new ClientBoard();


function setup() {

    const canvas = document.getElementById('main') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    canvas.onmouseleave = ((e) => {
        local_board.view.is_drawing_interactor = false;
        draw(canvas, ctx, local_board.graph);
    });

    canvas.onmouseenter = ((e) => {
        local_board.view.is_drawing_interactor = true;
        draw(canvas, ctx, local_board.graph);
    })

    setup_socket(canvas, ctx, local_board);

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    window.addEventListener('resize', function () { 
        resizeCanvas(canvas, ctx, local_board.graph); 
    }, false);
    document.addEventListener('contextmenu', event => event.preventDefault());
    setup_interactions(canvas, ctx, local_board.graph);
    setup_interactors_div(canvas, ctx, local_board.graph);
    select_interactor(interactor_edge, canvas, ctx, local_board.graph, null);

    setup_actions_div(canvas, ctx, local_board.graph);
    setup_generators_div(canvas, local_board);
    setup_modifyers_div(canvas, local_board.view);

    setup_parametors_available();
    update_params_available_div(canvas, ctx, local_board.graph);

    let params_loaded_button = document.getElementById("params_loaded_button");
    params_loaded_button?.addEventListener('click', () => {
        params_available_turn_on_div();
    });

    let params_available_button = document.getElementById("params_available_button");
    params_available_button?.addEventListener('click', () => {
        params_available_turn_off_div();
    });





    draw(canvas, ctx, local_board.graph);
}

setup()


