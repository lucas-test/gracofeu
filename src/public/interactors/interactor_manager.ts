import { Interactor, DOWN_TYPE } from './interactor'
import { interactor_selection } from './selection_interactor';
import { interactor_edge } from './edge_interactor';
import { draw } from '../draw';
import { socket } from '../socket';
import { Graph } from '../board/graph';
import { interactor_arc } from './arc_interactor';
import { color_interactor } from './color_interactor';
import { interactor_stroke } from './stroke_interactor';
import { interactor_eraser } from './eraser_interactor';
import { interactor_area } from './area_interactor';
import { actions_available, select_action } from '../actions';
import { self_user, update_users_canvas_pos } from '../user';
import { CanvasCoord } from '../board/coord';
import { local_board } from '../setup';
import { interactor_detector } from './detector_interactor';
import ENV from '../.env.json';
import { regenerate_graph } from '../generators/dom';
import { interactor_text } from './text';
import { clear_clipboard, clipboard_comes_from_generator, graph_clipboard, mouse_position_at_generation, paste_generated_graph, set_clipboard } from '../clipboard';

// INTERACTOR MANAGER




export let interactor_loaded: Interactor = null;
export let down_coord: CanvasCoord = null;
export let last_down: DOWN_TYPE = null;
export let last_down_index: number = null;
export let has_moved: boolean = false;
export let mouse_pos = new CanvasCoord(0, 0);
export let key_states = new Map<string, boolean>();

// key states
key_states.set("Control", false);
key_states.set("Shift", false);


export function select_interactor(interactor: Interactor, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, pos: CanvasCoord) {
    if (interactor_loaded != null && interactor_loaded != interactor) {
        interactor_loaded.onleave();
    }
    interactor_loaded = interactor;
    canvas.style.cursor = interactor.cursor_style;
    local_board.view.is_creating_vertex = false;
    interactor.trigger(pos,g);
    select_interactor_div(interactor);
    requestAnimationFrame(function () { draw(canvas, ctx, g) });
}


export function setup_interactions(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {


    window.addEventListener('keydown', function (e) {
        if (e.key == "Control") {
            key_states.set("Control", true);
        }
        if (e.key == "Shift") {
            key_states.set("Shift", true);
        }

        if (document.activeElement.nodeName == "BODY") { // otherwise focus is on a text
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
                g.strokes.forEach((s, index) => {
                    if (s.is_selected) {
                        data_socket.push({ type: "stroke", index: index });
                    }
                })

                socket.emit("delete_selected_elements", data_socket);
                return;
            }
            if ( e.key.toLowerCase() == "c" ){
                const subgraph = g.get_induced_subgraph_from_selection();
                if ( subgraph.vertices.size > 0){
                    set_clipboard(subgraph, mouse_pos.copy(), false, canvas);
                }
                return;
            }
            for (let interactor of interactors_available) {
                if (interactor.shortcut == e.key.toLowerCase()) {
                    deselect_all_interactor_div()
                    select_interactor(interactor, canvas, ctx, g, mouse_pos);
                    return;
                }
            }
            for (const action of actions_available) {
                if (action.shortcut == e.key) {
                    select_action(action, canvas, ctx, g);
                }
            }
        }
    });

    window.addEventListener('keyup', function (e) {
        if (e.key == "Control") {
            key_states.set("Control", false);
        }
        if (e.key == "Shift") {
            key_states.set("Shift", false);
        }
    })

    canvas.addEventListener("wheel", function (e) {
        if (e.deltaY > 0) {
            local_board.view.apply_zoom_to_center(new CanvasCoord(e.pageX, e.pageY), 1 / 1.1);
        } else {
            local_board.view.apply_zoom_to_center(new CanvasCoord(e.pageX, e.pageY), 1.1);
        }
        g.update_canvas_pos();
        update_users_canvas_pos();


        if (local_board.view.following !== null) {
            self_user.unfollow(local_board.view.following);
        }
        socket.emit("my_view", local_board.view.camera.x, local_board.view.camera.y, local_board.view.zoom);

        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    });

    canvas.addEventListener('mouseup', function (e) {
        if (e.which == 1) { // left click
            const click_pos = new CanvasCoord(e.pageX, e.pageY);
            down_coord = null;
            interactor_loaded.mouseup(canvas, ctx, g, click_pos);
            last_down = null;
            last_down_index = null;
            local_board.view.alignement_horizontal = false;
            local_board.view.alignement_vertical = false;
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        }
    })

    canvas.addEventListener('mousemove', function (e) {
        const click_pos = new CanvasCoord(e.pageX, e.pageY);
        mouse_pos.x = e.pageX;
        mouse_pos.y = e.pageY;
        has_moved = true;
        if (graph_clipboard != null) {
            graph_clipboard.translate(click_pos.sub2(mouse_position_at_generation));
            draw(canvas, ctx, g);
        } else {
            if (interactor_loaded.mousemove(canvas, ctx, g, click_pos)) {
                requestAnimationFrame(function () {
                    draw(canvas, ctx, g)
                });
            }
        }

        const mouse_server_coord = local_board.view.serverCoord(e);
        socket.emit("moving_cursor", mouse_server_coord.x, mouse_server_coord.y);
    })

    canvas.addEventListener('mousedown', function (e) {
        if (e.which == 1) { // Left click 
            down_coord = new CanvasCoord(e.pageX, e.pageY);
            has_moved = false;

            if (graph_clipboard != null) {
                paste_generated_graph();
                if( key_states.get("Control") ){
                    if (clipboard_comes_from_generator){
                        regenerate_graph(e, canvas);
                    }                    
                }else {
                    clear_clipboard(canvas);
                }
                draw(canvas, ctx, g);
            } else {
                const element = g.get_element_nearby(down_coord, interactor_loaded.interactable_element_type);
                console.log(element);
                last_down = element.type;
                last_down_index = element.index;
                interactor_loaded.mousedown(canvas, ctx, g, down_coord)
                if (element.type != DOWN_TYPE.EMPTY) {
                    requestAnimationFrame(function () { draw(canvas, ctx, g) });
                }
            }
        }
    })

    canvas.addEventListener('touchstart', (et: TouchEvent) => {
        console.log("touchstart");
        has_moved = false;
        const click_pos = new CanvasCoord(et.touches[0].clientX, et.touches[0].clientY);

        const element = g.get_element_nearby(click_pos, interactor_loaded.interactable_element_type);
        console.log(element);
        last_down = element.type;
        last_down_index = element.index;
        interactor_loaded.mousedown(canvas, ctx, g, click_pos)
        if (element.type != DOWN_TYPE.EMPTY) {
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        mouse_pos.x = e.touches[0].clientX;
        mouse_pos.y = e.touches[0].clientY;
        has_moved = true;
        if (interactor_loaded.mousemove(canvas, ctx, g, mouse_pos)) {
            requestAnimationFrame(function () {
                draw(canvas, ctx, g)
            });
        }
        const mouse_server_coord = local_board.view.serverCoord2(mouse_pos);
        socket.emit("moving_cursor", mouse_server_coord.x, mouse_server_coord.y);
    });

    canvas.addEventListener('touchend', (e) => {
        const click_pos = mouse_pos;
        interactor_loaded.mouseup(canvas, ctx, g, click_pos);
        last_down = null;
        last_down_index = null;
        local_board.view.alignement_horizontal = false;
        local_board.view.alignement_vertical = false;
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    });


}








let interactors_available = [];

if (ENV.mode == "dev") {
    interactors_available.push(interactor_detector);
}

interactors_available.push(interactor_selection, interactor_edge, interactor_arc, color_interactor, interactor_stroke, interactor_eraser, interactor_text, interactor_area)



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
        else {
            div.classList.remove("selected");
        }
    }
}


export function setup_interactors_div(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    let interactors_div = document.getElementById("interaction_mode_selector");
    for (let interactor of interactors_available) {
        let newDiv = document.createElement("div");
        newDiv.classList.add("interactor");
        newDiv.id = interactor.name;
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

        newDiv.onclick = function () {
            select_interactor(interactor, canvas, ctx, g, null);
            div_recap.style.display = "none";
        };
    }
}

