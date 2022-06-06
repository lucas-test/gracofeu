import { Graph } from "../server/graph";
import { draw } from "./draw";
import { interactor_edge } from "./interactors/edge_interactor";
import { setup_interactions, select_interactor, setup_interactors_div } from "./interactors/interactor_manager";


import { io } from "socket.io-client";
import { params_available_turn_off_div, params_available_turn_on_div, update_params_available_div } from "./parametors/div_parametor";
import { setup_parametors_available } from "./parametors/parametor_manager";
const socket = io("http://localhost:5000")
socket.emit("message", "hello from new client");




function setup() {
    let g = new Graph();
    g.add_vertex(100, 100);
    g.add_vertex(300, 200);
    g.add_edge(0, 1);



    let canvas = document.getElementById('main') as HTMLCanvasElement;
    let ctx = canvas.getContext('2d');

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    document.addEventListener('contextmenu', event => event.preventDefault());
    setup_interactions(canvas, ctx, g);
    setup_interactors_div();
    select_interactor(interactor_edge);

    
    setup_parametors_available();
    update_params_available_div(canvas,ctx,g);

    let params_loaded_button = document.getElementById("params_loaded_button");
    params_loaded_button?.addEventListener('click', () => {
        params_available_turn_on_div();
    });

    let params_available_button = document.getElementById("params_available_button");
    params_available_button?.addEventListener('click', () => {
        params_available_turn_off_div();
    });
    


    draw(canvas, ctx, g);
}

setup()