const SELECTION_COLOR = 'green' // avant c'était '#00ffff'
const COLOR_BACKGROUND = "#1e1e1e";
const GRID_COLOR = '#777777';


import { view } from './camera';
import { User, users } from './user';
import { Coord, Graph } from './local_graph';

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


export function draw_circle(center: Coord, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = "grey";
    ctx.arc(center.x, center.y, 10, 0, 2 * Math.PI);
    ctx.globalAlpha = 0.5;

    ctx.fill();
    ctx.globalAlpha = 1;
}

export function draw_vertex(index: number, g: Graph, ctx: CanvasRenderingContext2D) {
    const vertex = g.vertices.get(index);

    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.beginPath();
    ctx.arc(vertex.pos.x + view.camera.x, vertex.pos.y + view.camera.y, 10, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "white";

    if (vertex.is_selected) { ctx.fillStyle = SELECTION_COLOR; }
    ctx.beginPath();
    ctx.arc(vertex.pos.x + view.camera.x, vertex.pos.y + view.camera.y, 8, 0, 2 * Math.PI);
    ctx.fill();


    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.beginPath();
    ctx.arc(vertex.pos.x + view.camera.x, vertex.pos.y + view.camera.y, 6, 0, 2 * Math.PI);
    ctx.fill();
}

export function draw_user(user: User, ctx: CanvasRenderingContext2D) {
    // ctx.font = "15px serif";
    // ctx.beginPath();
    // ctx.fillStyle = user.color;
    // let text = ctx.measureText(user.label);
    // ctx.rect(user.pos.x + view.camera.x - 5, user.pos.y + view.camera.y - 17, text.width + 10, 19);
    // ctx.fill();


    // ctx.beginPath();
    // ctx.fillStyle = "black";
    // ctx.fillText(user.label, user.pos.x + view.camera.x, user.pos.y + view.camera.y);
    // ctx.fill();


    ctx.font = "400 17px Arial";
    const text = ctx.measureText(user.label);

    ctx.strokeStyle = user.color;  
    ctx.fillStyle = user.color; 
    drawRoundRect(ctx, user.pos.x+10 + view.camera.x, user.pos.y + 17 + view.camera.y, text.width + 10, 21, 5, user.color, user.color);

    ctx.beginPath();
        ctx.fillStyle = invertColor(user.color);
        ctx.fillText(user.label, user.pos.x+10 + 5 + view.camera.x, user.pos.y + 17 + 16 + view.camera.y);
    ctx.fill();
        
        
    ctx.beginPath();              
    ctx.lineWidth = 2;
    ctx.strokeStyle =  user.color; 
    ctx.fillStyle = user.color;  
    ctx.moveTo(user.pos.x, user.pos.y);
    ctx.lineTo(user.pos.x+10, user.pos.y+10);
    ctx.lineTo(user.pos.x+4, user.pos.y+10);
    ctx.lineTo(user.pos.x, user.pos.y+15);
    ctx.closePath();
    ctx.stroke(); 
    ctx.fill();

}


function draw_rectangular_selection(ctx: CanvasRenderingContext2D) {
    if (view.is_rectangular_selecting) {
        ctx.beginPath();
        ctx.strokeStyle = SELECTION_COLOR;
        ctx.rect(view.selection_corner_1.x, view.selection_corner_1.y, view.selection_corner_2.x -view.selection_corner_1.x,view.selection_corner_2.y-view.selection_corner_1.y);
        ctx.stroke();
        
        ctx.globalAlpha = 0.07;
        ctx.fillStyle = SELECTION_COLOR;
        ctx.fill();

        ctx.globalAlpha = 1;
    }
}

function draw_grid(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D){
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

// DRAW EDGES
function draw_edges(ctx: CanvasRenderingContext2D, g: Graph) {
    for (let edge of g.edges.values()) {
        let u = g.vertices.get(edge.start_vertex);
        let v = g.vertices.get(edge.end_vertex);

        ctx.beginPath();
        ctx.strokeStyle = "white";
        if (edge.is_selected) { ctx.strokeStyle = SELECTION_COLOR; }

        ctx.lineWidth = 3;
        ctx.moveTo(u.pos.x + view.camera.x, u.pos.y + view.camera.y);
        ctx.lineTo(v.pos.x + view.camera.x, v.pos.y + view.camera.y);
        ctx.stroke();
    }
}

function draw_edge_creating(ctx: CanvasRenderingContext2D) {
    if (view.is_edge_creating) {
        draw_line(view.edge_creating_start, view.edge_creating_end, ctx);
        draw_circle(view.edge_creating_end, ctx);
        //draw_vertex(vertex, ctx); // for esthetic reasons // on peut plus faire ça maintenant
    }
}

export function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    draw_background(canvas, ctx);
    draw_edges(ctx, g);
    draw_edge_creating(ctx);
    draw_vertices(ctx, g);
    draw_users(ctx);
    draw_rectangular_selection(ctx);
}



// Credits: https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
function invertColor(hex:string) {
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


function drawRoundRect (ctx:CanvasRenderingContext2D, x:number, y:number, w:number, h:number, r:number, fillColor?:string, strokeColor?:string) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;

    ctx.beginPath();
    if(typeof fillColor !== 'undefined'){
        ctx.fillStyle = fillColor;
    }
    if(typeof strokeColor !== 'undefined'){
        ctx.strokeStyle = strokeColor;
    }
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y,   x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x,   y+h, r);
    ctx.arcTo(x,   y+h, x,   y,   r);
    ctx.arcTo(x,   y,   x+w, y,   r);

    if(typeof fillColor !== 'undefined'){
        ctx.fill();
    }
    ctx.closePath();
  }