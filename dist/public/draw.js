const SELECTION_COLOR = 'green'; // avant c'était '#00ffff'
const COLOR_BACKGROUND = "#1e1e1e";
function draw_background(canvas, ctx) {
    ctx.beginPath();
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
}
function draw_line(v, x, y, ctx) {
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(v.pos.x, v.pos.y);
    ctx.lineTo(x, y);
    ctx.stroke();
}
// DRAW VERTICES
function draw_vertices(ctx, g) {
    for (let vertex of g.vertices.values()) {
        ctx.fillStyle = "white";
        ctx.strokeStyle = COLOR_BACKGROUND;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(vertex.pos.x, vertex.pos.y, 10, 0, 2 * Math.PI);
        ctx.fill();
    }
}
// DRAW EDGES
function draw_edges(ctx, g) {
    for (let edge of g.edges) {
        let u = g.vertices.get(edge.start_vertex);
        let v = g.vertices.get(edge.end_vertex);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(u.pos.x, u.pos.y);
        ctx.lineTo(v.pos.x, v.pos.y);
        ctx.stroke();
    }
}
function draw(canvas, ctx, g) {
    draw_background(canvas, ctx);
    draw_vertices(ctx, g);
    draw_edges(ctx, g);
}
//# sourceMappingURL=draw.js.map