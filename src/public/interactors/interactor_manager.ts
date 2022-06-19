import { Interactor, DOWN_TYPE } from './interactor'
import { interactor_selection } from './selection_interactor';
import { interactor_edge } from './edge_interactor';
import { draw } from '../draw';
import { update_params_loaded } from '../parametors/parametor_manager';
import { view } from '../camera';
import { socket } from '../socket';
import { Coord, Graph } from '../local_graph';
import { interactor_arc } from './arc_interactor';

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
            g.links.forEach((link, index) => {
                if (link.is_selected) {
                    data_socket.push({ type: "link", index: index });
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

    canvas.addEventListener("wheel", function (e) {
        if (e.deltaY > 0) {
            view.apply_zoom(e, 1 / 1.1);
        } else {
            view.apply_zoom(e, 1.1);
        }
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    });

    canvas.addEventListener('mouseup', function (e) {
        if (e.which == 1) { // left click
            interactor_loaded.mouseup(canvas, ctx, g, e);
            interactor_loaded.last_down = null;
            interactor_loaded.last_down_index = null;
            interactor_loaded.last_down_pos = null;
            view.alignement_horizontal = false;
            view.alignement_vertical = false;
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
        const mouse_server_coord = view.serverCoord(e);
        socket.emit("moving_cursor", mouse_server_coord.x, mouse_server_coord.y);
    })

    canvas.addEventListener('mousedown', function (e) {
        if (e.which == 1) { // Left click 
            interactor_loaded.has_moved = false;
            interactor_loaded.last_down_pos = view.serverCoord(e);

            const element = g.get_element_nearby(interactor_loaded.last_down_pos);
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








let interactors_available = [interactor_selection, interactor_edge, interactor_arc]

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
        div_recap.innerHTML = interactor.name + " <span class='shortcut'>" + interactor.shortcut + "</span>";
        document.body.appendChild(div_recap);

        newDiv.onmouseenter = function () {
            var offsets = newDiv.getBoundingClientRect();
            div_recap.style.display = "block"
            div_recap.style.left = "70" // String(e.clientX + 30)
            div_recap.style.top = String(offsets.top) //String(e.clientY - 16)
        }

        newDiv.onmouseleave = function () {
            div_recap.style.display = "none"
        }
    }
}

