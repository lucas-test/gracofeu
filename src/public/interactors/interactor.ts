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










// INTERACTOR MANAGER



enum DOWN_TYPE {
    EMPTY,
    VERTEX_NON_SELECTED,
    VERTEX_SELECTED
}

var interactor_loaded: Interactor = null;


function select_interactor(interactor: Interactor) {
    interactor_loaded = interactor;
    select_interactor_div(interactor);
}


function setup_interactions(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {


    window.addEventListener('keydown', function (e) {
        if (e.key == "Delete") {
            // remove_selected_elements(g)
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
    })

    canvas.addEventListener('mousedown', function (e) {
        if (e.which == 1) { // Left click 
            interactor_loaded.has_moved = false;
            interactor_loaded.last_down_pos = new Coord(e.pageX, e.pageY)

            let index = g.get_vertex_index_nearby(e.pageX, e.pageY);
            if (index !== null) {
                let v = g.vertices.get(index);
                if (v.selected) {
                    interactor_loaded.last_down = DOWN_TYPE.VERTEX_SELECTED;
                } else {
                    interactor_loaded.last_down = DOWN_TYPE.VERTEX_NON_SELECTED;
                    interactor_loaded.last_down_index = index;
                    interactor_loaded.mousedown(interactor_loaded.last_down, index, canvas, ctx, g, e)
                    return
                }
            }

            interactor_loaded.last_down = DOWN_TYPE.EMPTY;
            interactor_loaded.mousedown(interactor_loaded.last_down, null, canvas, ctx, g, e)
            //update_params_loaded(g)
            requestAnimationFrame(function () {
                draw(canvas, ctx, g)
            });
        }
    })
}