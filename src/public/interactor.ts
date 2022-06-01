class Interactor {
    name: string;
    shortcut: string;
    img_src: string;
    last_down: DOWN_TYPE;
    last_down_index: number;
    last_down_pos: Coord;
    has_moved: boolean;
    mousedown: (down_type: DOWN_TYPE, down_element_index: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: MouseEvent) => void;
    mousemove: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: MouseEvent) => boolean;
    mouseup: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: MouseEvent) => void;

    constructor(name: string, shortcut: string, img_src: string) {
        this.name = name;
        this.shortcut = shortcut;
        this.img_src = img_src;
        this.has_moved = false;
        this.last_down = null;
        this.last_down_index = null;
    }
}



// INTERACTOR SELECTION

var interactor_selection = new Interactor("selection", "s", "selection.svg")

interactor_selection.mousedown = ((down_type, down_element_index, canvas, ctx, g, e) => {
    if (down_type == DOWN_TYPE.VERTEX_NON_SELECTED) {
        let vertex = g.vertices.get(down_element_index);
        vertex.save_pos();
    }
})

interactor_selection.mousemove = ((canvas, ctx, g, e) => {
    console.log("mousemove");
    if (interactor_selection.last_down == DOWN_TYPE.VERTEX_NON_SELECTED) {
        let vertex = g.vertices.get(interactor_selection.last_down_index);
        vertex.update_pos_from_old(e.pageX - interactor_selection.last_down_pos.x, e.pageY - interactor_selection.last_down_pos.y)
        return true;
    }
    return false;
})

interactor_selection.mouseup = ((canvas, ctx, g, e) => {
    console.log("mouseup", interactor_selection.has_moved);
})


// INTERACTOR EDGE

var index_last_created_vertex = null; // est ce qu'on peut pas intégrer ça dans interactor_edge directement ?


var interactor_edge = new Interactor("edge", "e", "edition.svg");

interactor_edge.mousedown = ((d, k, canvas, ctx, g, e) => {
    if (d == DOWN_TYPE.EMPTY) {
        let index = g.add_vertex(e.pageX, e.pageY);
        index_last_created_vertex = index;
    }
})

interactor_edge.mousemove = ((canvas, ctx, g, e) => {
    console.log("mousemove");
    if (interactor_edge.last_down == DOWN_TYPE.EMPTY) {
        let vertex = g.vertices.get(index_last_created_vertex);
        draw(canvas, ctx, g);
        draw_line(vertex, e.pageX, e.pageY, ctx);
        return false;
    }
    return false;
})

interactor_edge.mouseup = ((canvas, ctx, g, e) => {
    console.log("mouseup", interactor_edge.has_moved);
})






// INTERACTOR MANAGER



enum DOWN_TYPE {
    EMPTY,
    VERTEX_NON_SELECTED,
    VERTEX_SELECTED
}

var interactor_loaded: Interactor = null;


function select_interactor(interactor: Interactor){
    interactor_loaded = interactor;
    select_interactor_div(interactor);
}


function setup_interactions(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {


    window.addEventListener('keydown', function (e) {
        if (e.key == "Delete") {
            // remove_selected_elements(g)
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
            return;
        }
        for (let interactor of interactors_available){
            if (interactor.shortcut == e.key) {
                deselect_all_interactor_div()
                select_interactor(interactor);
                return;
            }
        }
    });

    canvas.addEventListener('mouseup', function (e) {
        if (e.which == 1) { // left click
            interactor_loaded.last_down = null;
            interactor_loaded.last_down_index = null;
            interactor_loaded.last_down_pos = null;
            interactor_loaded.mouseup(canvas, ctx, g, e);
            //update_params_loaded(g)
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        }
    })

    canvas.addEventListener('mousemove', function (e) {
        interactor_loaded.has_moved = true;
        if (interactor_loaded.mousemove(canvas, ctx, g, e)) {
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        }
    })

    canvas.addEventListener('mousedown', function (e) {
        if (e.which == 1) { // Left click 
            interactor_loaded.has_moved = false;
            interactor_loaded.last_down_pos = new Coord(e.pageX, e.pageY)

            for (let k of g.vertices.keys()) {
                let v = g.vertices.get(k)
                if (v.dist2(e.pageX, e.pageY) <= 100) {

                    if (v.selected) {
                        interactor_loaded.last_down = DOWN_TYPE.VERTEX_SELECTED;
                    } else {
                        interactor_loaded.last_down = DOWN_TYPE.VERTEX_NON_SELECTED;
                    }
                    interactor_loaded.last_down_index = k;
                    interactor_loaded.mousedown(interactor_loaded.last_down, k, canvas, ctx, g, e)
                    return
                }
            }
            interactor_loaded.last_down = DOWN_TYPE.EMPTY;
            interactor_loaded.mousedown(interactor_loaded.last_down, null, canvas, ctx, g, e)
            //update_params_loaded(g)
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        }
    })
}






// INTERACTOR DIV


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


function setup_interactors_div() {
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

