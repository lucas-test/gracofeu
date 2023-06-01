import { Interactor, DOWN_TYPE, RESIZE_TYPE } from './interactor'
import { draw } from '../draw';
import { socket } from '../socket';
import { self_user, update_users_canvas_pos } from '../user';
import { local_board } from '../setup';
import { regenerate_graph } from '../generators/dom';
import { clear_clipboard, clipboard_comes_from_generator, graph_clipboard, mouse_position_at_generation, paste_generated_graph, set_clipboard } from '../clipboard';
import { CanvasCoord } from '../board/vertex';
import { ClientGraph } from '../board/graph';
import { CanvasVect } from '../board/vect';
import { ClientDegreeWidthRep } from '../board/representations/degree_width_rep';
import { BoardElementType } from '../board/board';
import { InteractorV2 } from '../side_bar/interactor_side_bar';

// INTERACTOR MANAGER



export let down_meta_element: any = "";
export let interactor_loaded: InteractorV2 = null;
export let down_coord: CanvasCoord = null;
export let last_down: DOWN_TYPE = null;
export let last_down_index: number = null;
export let has_moved: boolean = false;
export let mouse_pos: CanvasCoord = null;
export let key_states = new Map<string, boolean>();
export let mouse_buttons: string | number = "";
let previous_canvas_shift = new CanvasVect(0,0);

// key states
key_states.set("Control", false);
key_states.set("Shift", false);


export function select_interactor(interactor: InteractorV2, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: ClientGraph, pos: CanvasCoord) {
    if (interactor_loaded != null && interactor_loaded != interactor) {
        interactor_loaded.onleave();
    }

    const interactor_to_load = interactor;
    // const interactor_to_load = (interactor.subinteractors.length === 0)?interactor:interactor.subinteractors.at(0);
    
    interactor_loaded = interactor_to_load;
    canvas.style.cursor = interactor_to_load.cursor_style;
    local_board.view.is_creating_vertex = false;
    interactor_to_load.trigger(pos);
    select_interactor_div(interactor_to_load);
    requestAnimationFrame(function () { draw(canvas, ctx, g) });

}


export function setup_interactions(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: ClientGraph) {


    window.addEventListener('keydown', function (e) {
        if (e.key == "Control") {
            key_states.set("Control", true);
        }
        if (e.key == "Shift") {
            key_states.set("Shift", true);
        }

        if (document.activeElement.nodeName == "BODY") { // otherwise focus is on a text
            if (e.key == "d"){
                console.log("add dw representation");
                const dw_rep = ClientDegreeWidthRep.from_embedding(local_board.graph, local_board.view);
                local_board.representations.set(0, dw_rep);
                requestAnimationFrame(function () { draw(canvas, ctx, g) });
            }
            
            if (e.key == "Delete") {
                const data_socket = new Array();
                for (const index of g.vertices.keys()) {
                    const v = g.vertices.get(index);
                    if (v.is_selected) {
                        data_socket.push([BoardElementType.Vertex, index]);
                    }
                }
                g.links.forEach((link, index) => {
                    if (link.is_selected) {
                        data_socket.push([ BoardElementType.Link, index]);
                    }
                })
                local_board.strokes.forEach((s, index) => {
                    if (s.is_selected) {
                        data_socket.push([BoardElementType.Stroke, index]);
                    }
                })

                local_board.emit_delete_elements(data_socket);
                return;
            }
            if ( key_states.get("Control") && e.key.toLowerCase() == "c" ){
                const subgraph = g.get_induced_subgraph_from_selection(local_board.view);
                if ( subgraph.vertices.size > 0){
                    set_clipboard(subgraph, mouse_pos.copy(), false, canvas);
                }
                return;
            }
            if (key_states.get("Control") && e.key.toLowerCase() == "z") {
                console.log("Request: undo");
                local_board.emit_undo();
            }
            if (key_states.get("Control") && e.key.toLowerCase() == "y") {
                console.log("Request: redo");
                local_board.emit_redo();
            }
            document.querySelectorAll(".interactor").forEach(interactor => {
                interactor.classList.remove("selected");
            });
            for (let interactor of interactors_available) {
                if (interactor.shortcut == e.key.toLowerCase()) {
                    deselect_all_interactor_div()
                    select_interactor(interactor, canvas, ctx, g, mouse_pos);
                    return;
                }
            }
            /*
            for (const action of actions_available) {
                if (action.shortcut == e.key) {
                    select_action(action, canvas, ctx, g);
                }
            }
            */
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
        local_board.update_after_camera_change();
        local_board.update_canvas_pos(local_board.view);
        update_users_canvas_pos(local_board.view);


        if (local_board.view.following !== null) {
            self_user.unfollow(local_board.view.following);
        }
        socket.emit("my_view", local_board.view.camera.x, local_board.view.camera.y, local_board.view.zoom);

        requestAnimationFrame(function () { draw(canvas, ctx, g) });
    });

    canvas.addEventListener('mouseup', function (e) {
        const click_pos = new CanvasCoord(e.pageX, e.pageY);
        interactor_loaded.mouseup(canvas, ctx, g, click_pos);
        down_coord = null;
        last_down = null;
        last_down_index = null;
        local_board.view.alignement_horizontal = false;
        local_board.view.alignement_vertical = false;
        requestAnimationFrame(function () { draw(canvas, ctx, g) });
        mouse_buttons = "";
    })

    canvas.addEventListener('mousemove', function (e) {
        const click_pos = new CanvasCoord(e.pageX, e.pageY);
        mouse_pos = new CanvasCoord(e.pageX, e.pageY);
        has_moved = true;
        if (graph_clipboard != null) {
            const shift = CanvasVect.from_canvas_coords(mouse_position_at_generation,click_pos);
            graph_clipboard.translate_by_canvas_vect( shift.sub(previous_canvas_shift), local_board.view);
            previous_canvas_shift.set_from(shift);
            draw(canvas, ctx, g);
        } else {
            if (interactor_loaded.interactable_element_type.has(DOWN_TYPE.RESIZE)){
                const element = local_board.get_element_nearby(click_pos, interactor_loaded.interactable_element_type);
                canvas.style.cursor = RESIZE_TYPE.to_cursor(element.resize_type);
            } else {
                canvas.style.cursor = "default";
            }
            if (interactor_loaded.mousemove(canvas, ctx, g, click_pos)) {
                requestAnimationFrame(function () {
                    draw(canvas, ctx, g)
                });
            }
        }

        const mouse_server_coord = local_board.view.create_server_coord(click_pos);
        socket.emit("moving_cursor", mouse_server_coord.x, mouse_server_coord.y);
    })

    canvas.addEventListener('mousedown', function (e) {

        previous_canvas_shift = new CanvasVect(0,0);
        mouse_buttons = e.buttons;
        down_coord = new CanvasCoord(e.pageX, e.pageY);
        has_moved = false;

        if (graph_clipboard != null) {
            paste_generated_graph();
            if( key_states.get("Control") ){
                if (clipboard_comes_from_generator){
                    regenerate_graph(e, canvas, local_board.view);
                }                    
            }else {
                clear_clipboard(canvas);
            }
            draw(canvas, ctx, g);
        } else {
            const element = local_board.get_element_nearby(down_coord, interactor_loaded.interactable_element_type);
            console.log(element);
            last_down = element.type;
            last_down_index = element.index;
            down_meta_element = element;
            interactor_loaded.mousedown(canvas, ctx, g, down_coord)
            if (element.type != DOWN_TYPE.EMPTY) {
                requestAnimationFrame(function () { draw(canvas, ctx, g) });
            }
        }
    })

    canvas.addEventListener('touchstart', (et: TouchEvent) => {
        console.log("touchstart");
        has_moved = false;
        const click_pos = new CanvasCoord(et.touches[0].clientX, et.touches[0].clientY);

        const element = local_board.get_element_nearby(click_pos, interactor_loaded.interactable_element_type);
        console.log(element);
        last_down = element.type;
        last_down_index = element.index;
        interactor_loaded.mousedown(canvas, ctx, g, click_pos)
        if (element.type != DOWN_TYPE.EMPTY) {
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        mouse_pos = new CanvasCoord(e.touches[0].clientX, e.touches[0].clientY);
        has_moved = true;
        if (interactor_loaded.mousemove(canvas, ctx, g, mouse_pos)) {
            requestAnimationFrame(function () {
                draw(canvas, ctx, g)
            });
        }
        const mouse_server_coord = local_board.view.create_server_coord(mouse_pos);
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




function deselect_all_interactor_div() {
    for (let div of document.getElementsByClassName("interactor")) {
        div.classList.remove("selected");
    }

    
}

function deselect_subinteractor_bar_div(){

    let subinteractor_bar_container = document.getElementById("subinteractor_bar");
    if( subinteractor_bar_container != null){
        subinteractor_bar_container.innerHTML = "";
    }
}

function select_interactor_div(interactor: Interactor | InteractorV2 ) {
    for (let div of document.getElementsByClassName("interactor")) {
        if (div.id == interactor.id) {
            div.classList.add("selected");
        }
        else {
            div.classList.remove("selected");
        }
    }
}


export function setup_interactors_div(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: ClientGraph) {
    let subinteractor_bar_container = document.getElementById("subinteractor_bar");
    if( subinteractor_bar_container == null){
        subinteractor_bar_container = document.createElement("div");
        subinteractor_bar_container.id = "subinteractor_bar";
        document.body.appendChild(subinteractor_bar_container);
    }

    const interactors_div = document.getElementById("interaction_mode_selector");
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

        let time_out_id : NodeJS.Timeout | string = "";

        newDiv.onmouseenter = function () {

            if(interactor.subinteractors.length === 0){
                var offsets = newDiv.getBoundingClientRect();
                div_recap.style.display = "block"
                div_recap.style.left = "70px"; // String(e.clientX + 30)
                div_recap.style.top = String(offsets.top) + "px"; //String(e.clientY - 16)
            }
            else{
                // We reset the bar 
                subinteractor_bar_container.innerHTML = "";

                // We stop the timer.
                if(time_out_id !== "")
                {
                    clearTimeout(time_out_id);
                    time_out_id = "";
                }

                // Set the new bar on the left to the button
                const offsets = newDiv.getBoundingClientRect();
                subinteractor_bar_container.style.display = "flex";
                subinteractor_bar_container.style.left = String(offsets.left + 53 ) + "px"; 
                subinteractor_bar_container.style.top = String(offsets.top - 4) + "px";

                subinteractor_bar_container.onmouseenter = function(){
                    // We reset the fading timer 
                    if(time_out_id !== "")
                    {
                        clearTimeout(time_out_id);
                        time_out_id = "";
                    }
                }
                
                subinteractor_bar_container.onmouseleave = function () {
                    // We initiate the fading of the div
                    if(interactor.subinteractors.length !== 0){
                        time_out_id = setTimeout(()=>{
                            subinteractor_bar_container.innerHTML = "";
                        }, 500);
                    }
                }

                for(const subinteractor of interactor.subinteractors){
                    // We create the div
                    const new_subinteractor_div = document.createElement("div");
                    new_subinteractor_div.classList.add("interactor");
                    new_subinteractor_div.id = subinteractor.name;
                    new_subinteractor_div.innerHTML = '<img src="img/interactor/' + subinteractor.img_src + '" width="27px" />';
                    subinteractor_bar_container.appendChild(new_subinteractor_div);

                    new_subinteractor_div.onclick = function (){
                        // We select the interactor and we change the image 
                        deselect_all_interactor_div();
                        deselect_subinteractor_bar_div();
                        newDiv.innerHTML = '<img src="img/interactor/' + subinteractor.img_src + '" width="27px" />';
                        select_interactor(subinteractor, canvas, ctx, g, mouse_pos);
                        newDiv.classList.add("selected");
                        return;
                    }
                }
            }
        }

        newDiv.onmouseleave = function () {
            div_recap.style.display = "none";

            // We start the timer of the fading
            if(interactor.subinteractors.length !== 0){
                time_out_id = setTimeout(()=>{
                    subinteractor_bar_container.innerHTML = "";
                },500);
            }
        }

        newDiv.onclick = function () {
            select_interactor(interactor, canvas, ctx, g, null);
            div_recap.style.display = "none";
        };


        //  // SUBACTIONS
        // const new_subinteractions_div = document.createElement("div");
        // new_subinteractions_div.classList.add("subinteractions_container");
        // new_subinteractions_div.id = interactor.name + "_subinteractions";
        // new_subinteractions_div.style.display = "none";
        // new_subinteractions_div.addEventListener("mouseleave", (event) => {
        //     const target = event.target as HTMLDivElement;
        //     target.style.display = "none";
        // })

        // newDiv.onclick = function () {
        //     new_subinteractions_div.style.display = "block";
        //     interactor.trigger();
        //     requestAnimationFrame(function () { draw(canvas, ctx, g) });
        // };
        // //newDiv.innerHTML = '<img src="img/actions/' + action.img_src + '" width="30px" />';
        // //actions_div.appendChild(newDiv);



        // for (const subinteractor of interactor.subactions) {
        //     const new_subinteractor_div = document.createElement("div");
        //     new_subinteractor_div.classList.add("subaction");
        //     new_subinteractor_div.id = subinteractor.name;
        //     new_subinteractor_div.innerHTML = '<img src="img/interactor/' + subinteractor.img_src + '" width="27px" />';
        //     new_subinteractor_div.onclick = function () {
        //         new_subinteractor_div.style.display = "none";
        //         subinteractor.trigger();
        //         requestAnimationFrame(function () { draw(canvas, ctx, g) });
        //     };
        //     new_subinteractions_div.appendChild(new_subinteractor_div);

        //     //add_recap_div(subaction, new_subaction_div, 130);
        // }

        // //add_recap_div(action, newDiv, 70);
       


        // // APPEND TO DOCUMENT
        // document.body.appendChild(new_subinteractions_div);
    }
}



// ------------------------------------------------------




export function select_interactorV2(interactor: InteractorV2, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: ClientGraph, pos: CanvasCoord) {
    if (interactor_loaded != null && interactor_loaded != interactor) {
        interactor_loaded.onleave();
    }

    interactor_loaded = interactor;
    canvas.style.cursor = interactor.cursor_style;
    local_board.view.is_creating_vertex = false;
    interactor.trigger(pos);
    requestAnimationFrame(function () { draw(canvas, ctx, g) });
}

