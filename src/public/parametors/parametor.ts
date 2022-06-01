class Parametor {
    name: string;
    compute: (g: Graph) => string;

    constructor(name: string) {
        this.name = name;
    }
}




let params_loaded = []
let params_available = []


function setup_parametors_available() {
    params_available.push(param_nb_edges, param_nb_vertices)
}




function load_param(param: Parametor, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    let newDiv = document.createElement("div");
    newDiv.classList.add("param");
    newDiv.id = "param_" + param.name;
    newDiv.innerHTML = "<button onclick=\"remove_loaded_param('" + param.name + "')\">-</button> " + param.name + " : "

    let span_result = document.createElement("span");
    span_result.id = "span_result_" + param.name;
    span_result.innerHTML = "";
    newDiv.appendChild(span_result);

    document.getElementById("params_loaded").appendChild(newDiv);
    params_loaded.push(param)
    update_params_loaded(g)
    requestAnimationFrame(function () { draw(canvas, ctx, g) })
}




function update_params_loaded(g: Graph) {
    for (let param of params_loaded) {
        var result = param.compute(g)
        document.getElementById("span_result_" + param.name).innerHTML = result
    }
}

