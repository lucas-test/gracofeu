const SELECTION_COLOR = 'green' // avant c'était '#00ffff'
const COLOR_BACKGROUND = "#1e1e1e"

function print_background(canvas, ctx) {
    ctx.beginPath()
    ctx.fillStyle = COLOR_BACKGROUND
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
}

function draw(canvas, ctx) {
    print_background(canvas, ctx)
}