import { INDEX_TYPE } from "./board/camera";
import { CanvasCoord } from "./board/coord";
import { VERTEX_RADIUS } from "./draw";
import { local_board } from "./setup";
import BASIC_COLORS from "./basic_colors.json";

const ARC_ARROW_LENGTH = 12

function draw_triangle(ctx: CanvasRenderingContext2D, a: CanvasCoord, b: CanvasCoord, c: CanvasCoord){
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(a.x, a.y);
    ctx.stroke();
}


export function draw_line(start: CanvasCoord, end: CanvasCoord, ctx: CanvasRenderingContext2D, color: string) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}


export function draw_circle(center: CanvasCoord, fillStyle: string, radius: number, alpha: number, ctx: CanvasRenderingContext2D) {
    if(center != null){
        ctx.beginPath();
        ctx.fillStyle = fillStyle;
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        ctx.globalAlpha = alpha;

        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

export function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fillColor?: string, strokeColor?: string) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;

    ctx.beginPath();
    if (typeof fillColor !== 'undefined') {
        ctx.fillStyle = fillColor;
    }
    if (typeof strokeColor !== 'undefined') {
        ctx.strokeStyle = strokeColor;
    }
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);

    if (typeof fillColor !== 'undefined') {
        ctx.fill();
    }
    ctx.closePath();
}

export function draw_head(ctx: CanvasRenderingContext2D, start_pos: CanvasCoord, end_pos: CanvasCoord) {
    const headlen = ARC_ARROW_LENGTH;
    let vertex_radius = VERTEX_RADIUS;
    if (local_board.view.index_type != INDEX_TYPE.NONE) {
        vertex_radius = VERTEX_RADIUS * 2;
    }
    const d = Math.sqrt(start_pos.dist2(end_pos))
    const tox2 = end_pos.x + (start_pos.x - end_pos.x) * vertex_radius / d
    const toy2 = end_pos.y + (start_pos.y - end_pos.y) * vertex_radius / d
    const dx = tox2 - start_pos.x;
    const dy = toy2 - start_pos.y;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(tox2, toy2);
    ctx.lineTo(tox2 - headlen * Math.cos(angle - Math.PI / 6), toy2 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tox2, toy2);
    ctx.lineTo(tox2 - headlen * Math.cos(angle + Math.PI / 6), toy2 - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}


// set of available colors:
// "red", "green", "blue", "black", "grey", "orange", "yellow", "purple", "pink", "brown"
export function real_color(color: string, dark_mode: boolean){
    if (dark_mode){
        if ( color == "#000000"){
            return "white";
        }
        return BASIC_COLORS[color].dark;
    }else {
        if ( color == "#000000"){
            return "black";
        }
        return  BASIC_COLORS[color].light;
    }
}