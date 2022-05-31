const SELECTION_COLOR = 'green' // avant c'était '#00ffff'
const COLOR_BACKGROUND = "#1e1e1e"

function draw_background(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
}

function draw_line(v: Vertex, x: number, y: number, ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(v.pos.x, v.pos.y);
    ctx.lineTo(x, y);
    ctx.stroke();
}


// DRAW VERTICES
function draw_vertices(ctx: CanvasRenderingContext2D, g: Graph) {
    for (let vertex of g.vertices.values()) {
        vertex.draw(ctx);
    }
}

function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    draw_background(canvas, ctx);
    draw_vertices(ctx, g);
}