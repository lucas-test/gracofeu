import { Interactor, DOWN_TYPE } from './interactor'
import { interactor_selection } from './selection_interactor';
import { interactor_edge } from './edge_interactor';
import { Coord } from '../../server/coord';
import { Graph } from '../../server/graph';
import { draw } from '../draw';
import { update_params_loaded } from '../parametors/parametor_manager';
import { camera, view } from '../camera';
import { socket } from '../socket';

// INTERACTOR MANAGER




export var interactor_loaded: Interactor = null;


export function select_interactor(interactor: Interactor) {
    interactor_loaded = interactor;
    select_interactor_div(interactor);
}


export function setup_interactions(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {


    window.addEventListener('keydown', function (e) {
        if (e.key == "Delete") {
            // remove_selected_elements(g)
            requestAnimationFrame(function () {
                draw(canvas, ctx, g)
            });
            return;
        }
        else if(e.key == "g"){
            view.toggle_grid();
            requestAnimationFrame(function () {
                draw(canvas, ctx, g)
            });
            return;
        }
        for (let interactor of interactors_available) {
            if (interactor.shortcut == e.key) {
                deselect_all_interactor_div()
                select_interactor(interactor);
                return;
            }
        }
    });

    canvas.addEventListener('mouseup', function (e) {
        if (e.which == 1) { // left click
            interactor_loaded.mouseup(canvas, ctx, g, e);
            interactor_loaded.last_down = null;
            interactor_loaded.last_down_index = null;
            interactor_loaded.last_down_pos = null;
            update_params_loaded(g)
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        }
    })

    canvas.addEventListener('mousemove', function (e) {
        interactor_loaded.has_moved = true;
        if (interactor_loaded.mousemove(canvas, ctx, g, e)) {
            requestAnimationFrame(function () {
                draw(canvas, ctx, g)
            });
        }

        socket.emit("moving_cursor", e.pageX - camera.x, e.pageY - camera.y);
    })

    canvas.addEventListener('mousedown', function (e) {
        if (e.which == 1) { // Left click 
            interactor_loaded.has_moved = false;
            interactor_loaded.last_down_pos = new Coord(e.pageX, e.pageY)

            let index = g.get_vertex_index_nearby(e.pageX, e.pageY, camera.x, camera.y);
            if (index !== null) {
                interactor_loaded.last_down = DOWN_TYPE.VERTEX;
                interactor_loaded.last_down_index = index;
                interactor_loaded.mousedown(interactor_loaded.last_down, index, canvas, ctx, g, e)
                return
            }

            interactor_loaded.last_down = DOWN_TYPE.EMPTY;
            interactor_loaded.mousedown(interactor_loaded.last_down, null, canvas, ctx, g, e)
            update_params_loaded(g)
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        }
    })
}








let interactors_available = [interactor_selection, interactor_edge]

function deselect_all_interactor_div() {
    for (let div of document.getElementsByClassName("interactor")) {
        div.classList.remove("selected");
    }
}

function select_interactor_div(interactor: Interactor) {
    for (let div of document.getElementsByClassName("interactor")) {
        if (div.id == interactor.name) {
            div.classList.add("selected");
        }
    }
}


export function setup_interactors_div() {
    let interactors_div = document.getElementById("interaction_mode_selector");
    for (let interactor of interactors_available) {
        let newDiv = document.createElement("div");
        newDiv.classList.add("interactor");
        newDiv.id = interactor.name;
        newDiv.onclick = function () {
            deselect_all_interactor_div()
            newDiv.classList.add("selected")
            interactor_loaded = interactor
        };
        newDiv.innerHTML = '<img src="img/interactor/' + interactor.img_src + '" width="27px" />';
        interactors_div.appendChild(newDiv);

        let div_recap = document.createElement("div");
        div_recap.classList.add("interactor_recap");
        div_recap.innerHTML = interactor.name + " " + interactor.shortcut;
        document.body.appendChild(div_recap);

        newDiv.onmousemove = function (e) {
            div_recap.style.left = String(e.clientX + 30)
            div_recap.style.top = String(e.clientY - 16)
        }

        newDiv.onmouseenter = function () {
            div_recap.style.display = "block"
            div_recap.style.opacity = "1"
        }

        newDiv.onmouseleave = function () {
            div_recap.style.display = "none"
            div_recap.style.opacity = "0"
        }
    }
}

