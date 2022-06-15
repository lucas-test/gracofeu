import { Interactor, DOWN_TYPE } from './interactor'
import { interactor_selection } from './selection_interactor';
import { interactor_edge } from './edge_interactor';
import { draw } from '../draw';
import { update_params_loaded } from '../parametors/parametor_manager';
import { view } from '../camera';
import { socket } from '../socket';
import { Coord, Graph } from '../local_graph';

// INTERACTOR MANAGER




export var interactor_loaded: Interactor = null;


export function select_interactor(interactor: Interactor) {
    interactor_loaded = interactor;
    select_interactor_div(interactor);
}


export function setup_interactions(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {


    window.addEventListener('keydown', function (e) {
        if (e.key == "Delete") {
            const data_socket = new Array();
            for (const index of g.vertices.keys()) {
                const v = g.vertices.get(index);
                if (v.is_selected) {
                    data_socket.push({ type: "vertex", index: index });
                }
            }
            g.edges.forEach((edge, index) => {
                if (edge.is_selected) {
                    data_socket.push({ type: "edge", index: index });
                }
            })
            socket.emit("delete_selected_elements", data_socket);
            return;
        }
        else if (e.key == "g") {
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

        socket.emit("moving_cursor", e.pageX - view.camera.x, e.pageY - view.camera.y);
    })

    canvas.addEventListener('mousedown', function (e) {
        if (e.which == 1) { // Left click 
            interactor_loaded.has_moved = false;
            interactor_loaded.last_down_pos = new Coord(e.pageX, e.pageY)

            const element = g.get_element_nearby(interactor_loaded.last_down_pos.sub(view.camera));
            console.log(element);
            interactor_loaded.last_down = element.type;
            interactor_loaded.last_down_index = element.index;
            interactor_loaded.mousedown(interactor_loaded.last_down, element.index, canvas, ctx, g, e)
            if (element.type != DOWN_TYPE.EMPTY) {
                update_params_loaded(g)
                requestAnimationFrame(function () { draw(canvas, ctx, g) });
            }
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

