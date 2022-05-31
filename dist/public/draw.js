const SELECTION_COLOR = 'green'; // avant c'était '#00ffff'
const COLOR_BACKGROUND = "#1e1e1e";
function draw_background(canvas, ctx) {
    ctx.beginPath();
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
}
// DRAW VERTICES
function draw_vertices(ctx, g) {
    for (let vertex of g.vertices.values()) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(vertex.pos.x, vertex.pos.y, 8, 0, 2 * Math.PI);
        ctx.fill();
    }
}
function draw(canvas, ctx, g) {
    draw_background(canvas, ctx);
    draw_vertices(ctx, g);
}
//# sourceMappingURL=draw.js.map