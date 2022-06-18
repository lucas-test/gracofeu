const SELECTION_COLOR = 'green' // avant c'était '#00ffff'
const COLOR_BACKGROUND = "#1e1e1e";
const GRID_COLOR = '#777777';
const VERTEX_RADIUS = 8;
const ARC_ARROW_LENGTH = 12


import { INDEX_TYPE, view } from './camera';
import { User, users } from './user';
import { Coord, Graph, ORIENTATION } from './local_graph';





export function resizeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    requestAnimationFrame(function () { draw(canvas, ctx, g) })
}

function draw_head(ctx: CanvasRenderingContext2D, start_pos: Coord, end_pos: Coord) {
    const headlen = ARC_ARROW_LENGTH;
    let vertex_radius = VERTEX_RADIUS;
    if ( view.index_type != INDEX_TYPE.NONE){
        vertex_radius = VERTEX_RADIUS*2;
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

export function draw_line(start: Coord, end: Coord, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(start.x + view.camera.x, start.y + view.camera.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}


export function draw_circle(center: Coord, radius: number, alpha: number, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = "grey";
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.globalAlpha = alpha;

    ctx.fill();
    ctx.globalAlpha = 1;
}

export function draw_vertex(index: number, g: Graph, ctx: CanvasRenderingContext2D) {
    const vertex = g.vertices.get(index);
    let vertex_radius = VERTEX_RADIUS;
    if (view.index_type != INDEX_TYPE.NONE){
        vertex_radius = 2*VERTEX_RADIUS;
    }

    ctx.fillStyle = "white";
    if (vertex.is_selected) { ctx.fillStyle = SELECTION_COLOR; }
    ctx.beginPath();
    ctx.arc(vertex.pos.x + view.camera.x, vertex.pos.y + view.camera.y, vertex_radius, 0, 2 * Math.PI);
    ctx.fill();


    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.beginPath();
    ctx.arc(vertex.pos.x + view.camera.x, vertex.pos.y + view.camera.y, vertex_radius-2, 0, 2 * Math.PI);
    ctx.fill();

   // DRAW INDEX 
    if (view.index_type != INDEX_TYPE.NONE){
        ctx.font = "17px Arial";
        const measure = ctx.measureText(vertex.index_string);
        ctx.fillStyle = "white" 
        const px = Math.floor(vertex.pos.x - measure.width/2 + view.camera.x);
        const py = Math.floor(vertex.pos.y + 5 + view.camera.y)
        ctx.fillText(vertex.index_string, px, py);
    }
}

export function draw_user(user: User, ctx: CanvasRenderingContext2D) {

    // DRAW USERNAME 
    ctx.font = "400 17px Arial";
    const text = ctx.measureText(user.label);
    ctx.strokeStyle = user.color;  
    ctx.fillStyle = user.color;
    // Rectangle 
    drawRoundRect(ctx, user.pos.x+10 + view.camera.x, user.pos.y + 17 + view.camera.y, text.width + 10, 21, 5, user.color, user.color);

    const contrast_color = invertColor(user.color);
    
    // username
    ctx.beginPath();
        ctx.fillStyle = contrast_color;
        ctx.fillText(user.label, user.pos.x+10 + 5 + view.camera.x, user.pos.y + 17 + 16 + view.camera.y);
    ctx.fill();


    // DRAW ARROW
    const darken_color = shadeColor (user.color, -60 );
    const brighter_color = shadeColor (user.color, 120 );

    // Background
    ctx.beginPath();              
        ctx.lineWidth = 4;
        ctx.strokeStyle = darken_color;  
        ctx.moveTo(user.pos.x+ view.camera.x-2, user.pos.y+1+ view.camera.y);
        ctx.lineTo(user.pos.x+ view.camera.x-2, user.pos.y+21+ view.camera.y);
    ctx.stroke();
    
    //Arrow
    ctx.beginPath();         
        ctx.fillStyle = user.color;  
        ctx.moveTo(user.pos.x+ view.camera.x, user.pos.y+ view.camera.y);
        ctx.lineTo(user.pos.x+13+ view.camera.x, user.pos.y+13+ view.camera.y);
        ctx.lineTo(user.pos.x+5+ view.camera.x, user.pos.y+13+ view.camera.y);
        ctx.lineTo(user.pos.x+ view.camera.x, user.pos.y+20+ view.camera.y);
    ctx.closePath();
    ctx.fill();

    // Bright sides
    ctx.beginPath();              
        ctx.lineWidth = 1;
        ctx.strokeStyle = brighter_color;  
        ctx.moveTo(user.pos.x+ view.camera.x, user.pos.y+ view.camera.y);
        ctx.lineTo(user.pos.x+13+ view.camera.x, user.pos.y+13+ view.camera.y);
        ctx.moveTo(user.pos.x+5+ view.camera.x, user.pos.y+13+ view.camera.y);
        ctx.lineTo(user.pos.x+ view.camera.x, user.pos.y+20+ view.camera.y);
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
    for (let i = view.camera.x % view.grid_size; i < canvas.width; i += view.grid_size) {
        ctx.beginPath();
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 1;
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }

    for (let i = view.camera.y % view.grid_size; i < canvas.height; i += view.grid_size) {
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

        ctx.beginPath();
        ctx.moveTo(u.pos.x + view.camera.x, u.pos.y + view.camera.y);
        ctx.strokeStyle = "white";
        if (link.is_selected) { ctx.strokeStyle = SELECTION_COLOR; }
        ctx.lineWidth = 3;
        ctx.quadraticCurveTo(link.cp.x+ view.camera.x, link.cp.y+ view.camera.y, v.pos.x + view.camera.x, v.pos.y+ view.camera.y);
        ctx.stroke();

        draw_circle(link.cp.add(view.camera), 4, 1, ctx);
        if ( link.orientation == ORIENTATION.DIRECTED){
            draw_head(ctx,link.cp.add(view.camera), v.pos.add(view.camera));
        }
    }
}

function draw_link_creating(ctx: CanvasRenderingContext2D) {
    if (view.is_link_creating) {
        draw_line(view.link_creating_start, view.link_creating_end, ctx);
        draw_circle(view.link_creating_end, 10, 0.5, ctx);
    }
}

export function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    draw_background(canvas, ctx);
    draw_links(ctx, g);
    draw_link_creating(ctx);
    draw_vertices(ctx, g);
    draw_users(ctx);
    draw_rectangular_selection(ctx);
}



// Credits: https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
function invertColor(hex: string) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    console.log(hex);
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



function shadeColor(color:string, percent:number) {
    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt((R * (100 + percent) / 100).toString());
    G = parseInt((G * (100 + percent) / 100).toString());
    B = parseInt((B * (100 + percent) / 100).toString());

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}