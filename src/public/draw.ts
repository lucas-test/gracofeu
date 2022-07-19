const SELECTION_COLOR = 'green' // avant c'était '#00ffff'
const COLOR_BACKGROUND = "#1e1e1e";
const GRID_COLOR = '#777777';
const VERTEX_RADIUS = 8;
const ARC_ARROW_LENGTH = 12
const COLOR_ALIGNEMENT_LINE = "#555555"


import { INDEX_TYPE, view } from './camera';
import { User, users } from './user';
import { CanvasCoord, Graph, ORIENTATION, ServerCoord } from './local_graph';
import { Stroke } from './stroke';
import { Area } from './area';





export function resizeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    requestAnimationFrame(function () { draw(canvas, ctx, g) })
}

function draw_head(ctx: CanvasRenderingContext2D, start_pos: CanvasCoord, end_pos: CanvasCoord) {
    const headlen = ARC_ARROW_LENGTH;
    let vertex_radius = VERTEX_RADIUS;
    if (view.index_type != INDEX_TYPE.NONE) {
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


export function draw_background(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();

    if (view.grid_show) {
        draw_grid(canvas, ctx);
    }
}

export function draw_line(start: CanvasCoord, end: CanvasCoord, ctx: CanvasRenderingContext2D, color: string) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}


export function draw_circle(center: CanvasCoord, fillStyle: string, radius: number, alpha: number, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = fillStyle;
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.globalAlpha = alpha;

    ctx.fill();
    ctx.globalAlpha = 1;
}

export function draw_vertex(index: number, g: Graph, ctx: CanvasRenderingContext2D) {
    const vertex = g.vertices.get(index);
    let vertex_radius = VERTEX_RADIUS;
    if (view.index_type != INDEX_TYPE.NONE) {
        vertex_radius = 2 * VERTEX_RADIUS;
    }

    if (vertex.is_selected) {
        draw_circle(vertex.canvas_pos, SELECTION_COLOR, vertex_radius, 1, ctx);
    } else {
        draw_circle(vertex.canvas_pos, "white", vertex_radius, 1, ctx);
    }

    draw_circle(vertex.canvas_pos, vertex.color, vertex_radius - 2, 1, ctx);

    // DRAW INDEX 
    if (view.index_type != INDEX_TYPE.NONE) {
        ctx.font = "17px Arial";
        const measure = ctx.measureText(vertex.index_string);
        ctx.fillStyle = "white"
        const pos = vertex.canvas_pos
        ctx.fillText(vertex.index_string, pos.x - measure.width / 2, pos.y + 5);
    }
}

export function draw_user(user: User, ctx: CanvasRenderingContext2D) {

    // DRAW USERNAME 
    ctx.font = "400 17px Arial";
    const text = ctx.measureText(user.label);
    ctx.strokeStyle = user.multicolor.color;
    ctx.fillStyle = user.multicolor.color;
    // Rectangle 
    const user_canvas_coord = user.canvas_pos;
    drawRoundRect(ctx, user_canvas_coord.x + 10, user_canvas_coord.y + 17, text.width + 10, 21, 5, user.multicolor.color, user.multicolor.color);

    const contrast_color = user.multicolor.contrast;

    // username
    ctx.beginPath();
    ctx.fillStyle = contrast_color;
    ctx.fillText(user.label, user_canvas_coord.x + 10 + 5, user_canvas_coord.y + 17 + 16);
    ctx.fill();


    // DRAW ARROW
    const darken_color = user.multicolor.darken;
    const brighter_color = user.multicolor.lighten;

    // Background
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = darken_color;
    ctx.moveTo(user_canvas_coord.x - 2, user_canvas_coord.y + 1);
    ctx.lineTo(user_canvas_coord.x - 2, user_canvas_coord.y + 21);
    ctx.stroke();

    //Arrow
    ctx.beginPath();
    ctx.fillStyle = user.multicolor.color;
    ctx.moveTo(user_canvas_coord.x, user_canvas_coord.y);
    ctx.lineTo(user_canvas_coord.x + 13, user_canvas_coord.y + 13);
    ctx.lineTo(user_canvas_coord.x + 5, user_canvas_coord.y + 13);
    ctx.lineTo(user_canvas_coord.x, user_canvas_coord.y + 20);
    ctx.closePath();
    ctx.fill();

    // Bright sides
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = brighter_color;
    ctx.moveTo(user_canvas_coord.x, user_canvas_coord.y);
    ctx.lineTo(user_canvas_coord.x + 13, user_canvas_coord.y + 13);
    ctx.lineTo(user_canvas_coord.x + 5, user_canvas_coord.y + 13);
    ctx.lineTo(user_canvas_coord.x, user_canvas_coord.y + 20);
    ctx.stroke();
}


function draw_rectangular_selection(ctx: CanvasRenderingContext2D) {
    if (view.is_rectangular_selecting) {
        ctx.beginPath();
        ctx.strokeStyle = SELECTION_COLOR;
        ctx.rect(view.selection_corner_1.x, view.selection_corner_1.y, view.selection_corner_2.x - view.selection_corner_1.x, view.selection_corner_2.y - view.selection_corner_1.y);
        ctx.stroke();

        ctx.globalAlpha = 0.07;
        ctx.fillStyle = SELECTION_COLOR;
        ctx.fill();

        ctx.globalAlpha = 1;
    }
}

function draw_grid(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const grid_size = view.grid_size;

    for (let i = view.camera.x % grid_size; i < canvas.width; i += grid_size) {
        ctx.beginPath();
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 1;
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }

    for (let i = view.camera.y % grid_size; i < canvas.height; i += grid_size) {
        ctx.beginPath();
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 1;
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}


// DRAW USERS
function draw_users(ctx: CanvasRenderingContext2D) {
    users.forEach(user => {
        draw_user(user, ctx);
    });
}


// DRAW VERTICES
function draw_vertices(ctx: CanvasRenderingContext2D, g: Graph) {
    for (const index of g.vertices.keys()) {
        draw_vertex(index, g, ctx);
    }
}

// DRAW LINKS
function draw_links(ctx: CanvasRenderingContext2D, g: Graph) {
    for (let link of g.links.values()) {
        let u = g.vertices.get(link.start_vertex);
        let v = g.vertices.get(link.end_vertex);

        const posu = u.canvas_pos; 
        const posv = v.canvas_pos; 
        const poscp = link.canvas_cp;
        ctx.beginPath();
        ctx.moveTo(posu.x, posu.y);
        ctx.strokeStyle = link.color;
        if (link.is_selected) { ctx.strokeStyle = SELECTION_COLOR; }
        ctx.lineWidth = 3;
        //ctx.quadraticCurveTo(poscp.x, poscp.y, posv.x, posv.y);
        ctx.bezierCurveTo(poscp.x, poscp.y, poscp.x, poscp.y, posv.x, posv.y);
        ctx.stroke();

        draw_circle(poscp, "grey", 4, 1, ctx);
        if (link.orientation == ORIENTATION.DIRECTED) {
            draw_head(ctx, poscp, posv);
        }
    }
}

function draw_vertex_creating(ctx: CanvasRenderingContext2D){
    if (view.is_creating_vertex){
        draw_circle(view.creating_vertex_pos, "grey", 10, 0.5, ctx);
    }
}

function draw_link_creating(ctx: CanvasRenderingContext2D) {
    if (view.is_link_creating) {
        draw_line(view.link_creating_start, view.creating_vertex_pos, ctx, "white");
        if (view.link_creating_type == ORIENTATION.DIRECTED) {
            draw_head(ctx, view.link_creating_start, view.creating_vertex_pos);
        }
    }
}

function draw_alignements(ctx: CanvasRenderingContext2D) {
    if (view.alignement_horizontal) {
        draw_line(new CanvasCoord(0, view.alignement_horizontal_y), new CanvasCoord(window.innerWidth, view.alignement_horizontal_y), ctx, COLOR_ALIGNEMENT_LINE);
    }
    if (view.alignement_vertical) {
        draw_line(new CanvasCoord(view.alignement_vertical_x, 0), new CanvasCoord(view.alignement_vertical_x, window.innerHeight), ctx, COLOR_ALIGNEMENT_LINE);
    }

}

// DRAW STROKES
function draw_stroke(ctx: CanvasRenderingContext2D, s:Stroke){
    if(s.positions.length > 0){ 
        if(s.is_selected){
            const tlcanvas = view.canvasCoord(s.top_left);
            const brcanvas = view.canvasCoord(s.bot_right);
            ctx.beginPath();
            ctx.strokeStyle = SELECTION_COLOR;
            ctx.lineWidth = 1;
            
            ctx.rect(tlcanvas.x - 3 ,tlcanvas.y - 3, brcanvas.x - tlcanvas.x + 6, brcanvas.y - tlcanvas.y + 6);
            ctx.stroke();

            
            let position_canvas = view.canvasCoord(s.positions[0]);
            ctx.beginPath();
            ctx.lineWidth = s.width + 4;
            ctx.moveTo(position_canvas.x, position_canvas.y);
            for(let i = 1; i<s.positions.length; i++){
                position_canvas = view.canvasCoord(s.positions[i]);
                ctx.lineTo(position_canvas.x, position_canvas.y);
            }
            ctx.stroke();
        }

        let position_canvas = view.canvasCoord(s.positions[0]);
        ctx.beginPath();
        ctx.strokeStyle = s.multicolor.color;
        ctx.lineWidth = s.width;
        ctx.moveTo(position_canvas.x, position_canvas.y);
        for(let i = 1; i<s.positions.length; i++){
            position_canvas = view.canvasCoord(s.positions[i]);
            ctx.lineTo(position_canvas.x, position_canvas.y);
        }
        ctx.stroke();
    }
}


function draw_strokes(ctx: CanvasRenderingContext2D, g:Graph){
    g.strokes.forEach(s => {
        draw_stroke(ctx, s);
    });
}


// DRAW AREA
function draw_area(ctx: CanvasRenderingContext2D, a:Area){
    ctx.beginPath();
        ctx.strokeStyle = a.multicolor.color;
        ctx.lineWidth = 2;
        const c1canvas = view.canvasCoord(a.c1);
        const c2canvas = view.canvasCoord(a.c2);
        ctx.rect(c1canvas.x , c1canvas.y, c2canvas.x - c1canvas.x, c2canvas.y - c1canvas.y);
        ctx.stroke();

        ctx.globalAlpha = 0.07;
        ctx.fillStyle = a.multicolor.color;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.font = "400 24px Arial";
        const measure = ctx.measureText(a.label);
        ctx.fillStyle = a.multicolor.color;
        const text_server_pos = new ServerCoord(Math.min(a.c1.x, a.c2.x), Math.max(a.c1.y, a.c2.y) ) ;
        const text_canvas_pos = view.canvasCoord(text_server_pos);
        ctx.rect(text_canvas_pos.x, text_canvas_pos.y - 29, measure.width + 10, 29);
        ctx.fill();

        
        ctx.beginPath();
        ctx.fillStyle = invertColor(a.multicolor.color);
        ctx.fillText(a.label, text_canvas_pos.x + 5, text_canvas_pos.y - 5);
        ctx.fill();

}


function draw_areas(ctx:CanvasRenderingContext2D, g:Graph)
{
    g.areas.forEach(a => {
        draw_area(ctx, a);
    });
}

export function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    draw_background(canvas, ctx);
    draw_areas(ctx, g);
    draw_alignements(ctx);
    draw_strokes(ctx, g);
    draw_links(ctx, g);
    draw_link_creating(ctx);
    draw_vertices(ctx, g);
    draw_users(ctx);
    draw_vertex_creating(ctx);
    draw_rectangular_selection(ctx);
}



// Credits: https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
export function invertColor(hex: string) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    // console.log(hex);
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);

    return (r * 0.299 + g * 0.587 + b * 0.114) > 186
        ? '#000000'
        : '#FFFFFF';
}


function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fillColor?: string, strokeColor?: string) {
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



export function shadeColor(color: string, percent: number) {
    var R = parseInt(color.substring(1, 3), 16);
    var G = parseInt(color.substring(3, 5), 16);
    var B = parseInt(color.substring(5, 7), 16);

    R = parseInt((R * (100 + percent) / 100).toString());
    G = parseInt((G * (100 + percent) / 100).toString());
    B = parseInt((B * (100 + percent) / 100).toString());

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}