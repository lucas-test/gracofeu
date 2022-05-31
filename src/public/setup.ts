function setup(){
    let canvas = document.getElementById('main') as HTMLCanvasElement;
    let ctx = canvas.getContext('2d');

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    document.addEventListener('contextmenu', event => event.preventDefault());
    print_background(canvas,ctx);
}

setup()