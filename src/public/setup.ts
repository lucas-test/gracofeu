function setup(){
    let g = new Graph();
    g.add_vertex(100,100);


    let canvas = document.getElementById('main') as HTMLCanvasElement;
    let ctx = canvas.getContext('2d');

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    document.addEventListener('contextmenu', event => event.preventDefault());
    draw(canvas,ctx,g);
}

setup()