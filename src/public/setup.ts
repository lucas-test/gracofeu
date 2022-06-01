function setup(){
    let g = new Graph();
    g.add_vertex(100,100);
    g.add_vertex(300,200);
    g.add_edge(0,1);


    let canvas = document.getElementById('main') as HTMLCanvasElement;
    let ctx = canvas.getContext('2d');

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    document.addEventListener('contextmenu', event => event.preventDefault());
    setup_interactions(canvas,ctx,g);
    setup_interactors_div();
    select_interactor(interactor_edge);
    draw(canvas,ctx,g);
}

setup()