class Interactor {
    name: string;
    shortcut: string;
    img_src: string;
    last_down: DOWN_TYPE;
    last_down_index: number;
    has_moved: boolean;
    mousedown: (d: DOWN_TYPE, k: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: MouseEvent) => void;
    mousemove: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: MouseEvent) => boolean;
    mouseup: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph, e: MouseEvent) => void;
    constructor(name: string) {
        this.name = name;
        this.has_moved = false;
    }
}

var index_last_created_vertex = null;

var interactor_lol = new Interactor("lol");
interactor_lol.mousedown = ((d, k, canvas, ctx, g, e) => {
    console.log("salut", d);
    if (d == DOWN_TYPE.EMPTY) {
        let index = g.add_vertex(e.pageX, e.pageY);
        index_last_created_vertex = index;
    }
})

interactor_lol.mousemove = ((canvas, ctx, g, e) => {
    console.log("mousemove");
    if (interactor_lol.last_down == DOWN_TYPE.EMPTY) {
        let vertex = g.vertices.get(index_last_created_vertex);
        draw(canvas,ctx,g);
        draw_line(vertex, e.pageX, e.pageY, ctx);
        return false;
    }
    return false;
})

interactor_lol.mouseup = ((canvas, ctx, g, e) => {
    console.log("mouseup", interactor_lol.has_moved);
})







enum DOWN_TYPE {
    EMPTY,
    VERTEX_NON_SELECTED,
    VERTEX_SELECTED
}

var interaction_mode_loaded: Interactor = interactor_lol;




function setup_interactions(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {

    canvas.addEventListener('mouseup', function (e) {
        if (e.which == 1) { // left click
            interaction_mode_loaded.last_down_index = null;
            interaction_mode_loaded.mouseup(canvas, ctx, g, e);
            //update_params_loaded(g)
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        }
    })

    canvas.addEventListener('mousemove', function (e) {
        interaction_mode_loaded.has_moved = true;
        if (interaction_mode_loaded.mousemove(canvas, ctx, g, e)) {
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        }
    })

    canvas.addEventListener('mousedown', function (e) {
        if (e.which == 1) { // Left click 
            interaction_mode_loaded.has_moved = false;
            for (let k of g.vertices.keys()) {
                let v = g.vertices.get(k)
                if (v.dist2(e.pageX, e.pageY) <= 100) {

                    if (v.selected) {
                        interaction_mode_loaded.last_down = DOWN_TYPE.VERTEX_SELECTED;
                    } else {
                        interaction_mode_loaded.last_down = DOWN_TYPE.VERTEX_NON_SELECTED;
                    }
                    interaction_mode_loaded.last_down_index = k;
                    interaction_mode_loaded.mousedown(interaction_mode_loaded.last_down, k, canvas, ctx, g, e)
                    return
                }
            }
            interaction_mode_loaded.last_down = DOWN_TYPE.EMPTY;
            interaction_mode_loaded.mousedown(interaction_mode_loaded.last_down, null, canvas, ctx, g, e)
            //update_params_loaded(g)
            requestAnimationFrame(function () { draw(canvas, ctx, g) });
        }
    })
}

