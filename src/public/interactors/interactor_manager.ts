import { Interactor, DOWN_TYPE } from './interactor'
import { interactor_selection } from './selection_interactor';
import { interactor_edge } from './edge_interactor';
import { draw } from '../draw';
import { update_params_loaded } from '../parametors/parametor_manager';
import { view } from '../camera';
import { socket } from '../socket';
import { CanvasCoord, Graph, ServerCoord } from '../local_graph';
import { interactor_arc } from './arc_interactor';
import { color_interactor } from './color_interactor';

// INTERACTOR MANAGER




export var interactor_loaded: Interactor = null;
let mouse_pos = new CanvasCoord(0, 0);


export function select_interactor(interactor: Interactor, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    interactor_loaded = interactor;
    view.is_creating_vertex = false;
    interactor.trigger(mouse_pos);
    select_interactor_div(interactor);
    requestAnimationFrame(function () { draw(canvas, ctx, g) });
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
                select_interactor(interactor, canvas, ctx, g);
                return;
            }
        }
    });

    canvas.addEventListener("wheel", function (e) {
        if (e.deltaY > 0) {
            view.apply_zoom(e, 1 / 1.1);
            g.update_canvas_pos()
        } else {
            view.apply_zoom(e, 1.1);
            g.update_canvas_pos()
        }
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    });

    canvas.addEventListener('mouseup', function (e) {
        if (e.which == 1) { // left click
            const click_pos = new CanvasCoord(e.pageX, e.pageY);
            interactor_loaded.mouseup(canvas, ctx, g, click_pos);
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
        const click_pos = new CanvasCoord(e.pageX, e.pageY);
        mouse_pos.x = e.pageX;
        mouse_pos.y = e.pageY;
        interactor_loaded.has_moved = true;
        if (interactor_loaded.mousemove(canvas, ctx, g, click_pos)) {
            requestAnimationFrame(function () {
                draw(canvas, ctx, g)
            });
        }
        const mouse_server_coord = view.serverCoord(e);
        socket.emit("moving_cursor", mouse_server_coord.x, mouse_server_coord.y);
    })

    canvas.addEventListener('mousedown', function (e) {
        if (e.which == 1) { // Left click 
            const click_pos = new CanvasCoord(e.pageX, e.pageY);
            interactor_loaded.has_moved = false;
            interactor_loaded.last_down_pos = view.serverCoord(e);

            const element = g.get_element_nearby(click_pos);
            console.log(element);
            interactor_loaded.last_down = element.type;
            interactor_loaded.last_down_index = element.index;
            interactor_loaded.mousedown(interactor_loaded.last_down, element.index, canvas, ctx, g, click_pos)
            if (element.type != DOWN_TYPE.EMPTY) {
                update_params_loaded(g)
                requestAnimationFrame(function () { draw(canvas, ctx, g) });
            }
        }
    })

    canvas.addEventListener('touchstart', (et: TouchEvent) => {
        console.log("touchstart");
        interactor_loaded.has_moved = false;
        const click_pos = new CanvasCoord(et.touches[0].clientX, et.touches[0].clientY);
        interactor_loaded.last_down_pos = view.serverCoord2(click_pos);
        
        const element = g.get_element_nearby(click_pos);
        console.log(element);
        interactor_loaded.last_down = element.type;
        interactor_loaded.last_down_index = element.index;
        interactor_loaded.mousedown(interactor_loaded.last_down, element.index, canvas, ctx, g, click_pos)
        if (element.type != DOWN_TYPE.EMPTY) {
            update_params_loaded(g)
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        mouse_pos.x = e.touches[0].clientX;
        mouse_pos.y = e.touches[0].clientY;
        interactor_loaded.has_moved = true;
        if (interactor_loaded.mousemove(canvas, ctx, g, mouse_pos)) {
            requestAnimationFrame(function () {
                draw(canvas, ctx, g)
            });
        }
        const mouse_server_coord = view.serverCoord2(mouse_pos);
        socket.emit("moving_cursor", mouse_server_coord.x, mouse_server_coord.y);
    });

    canvas.addEventListener('touchend', (e) => {
        const click_pos = mouse_pos;
        interactor_loaded.mouseup(canvas, ctx, g, click_pos);
        interactor_loaded.last_down = null;
        interactor_loaded.last_down_index = null;
        interactor_loaded.last_down_pos = null;
        view.alignement_horizontal = false;
        view.alignement_vertical = false;
        update_params_loaded(g)
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    });


}








let interactors_available = [interactor_selection, interactor_edge, interactor_arc, color_interactor]

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

