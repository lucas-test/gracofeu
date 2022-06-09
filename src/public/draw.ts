const SELECTION_COLOR = 'green' // avant c'était '#00ffff'
const COLOR_BACKGROUND = "#1e1e1e";
const GRID_COLOR = '#777777';

import { Coord } from '../server/coord';
import { Vertex } from '../server/vertex';
import { Edge } from '../server/edge';
import { Graph } from '../server/graph';
import { camera, view } from './camera';

function draw_background(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();

    if(view.grid_show){
        for(let i = camera.x%view.grid_size; i <  canvas.width; i+=view.grid_size){
            ctx.strokeStyle = GRID_COLOR;     
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }

        for(let i = camera.y%view.grid_size; i <  canvas.height; i+=view.grid_size){
            ctx.strokeStyle = GRID_COLOR;     
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
    }
}

export function draw_line(v: Vertex, x: number, y: number, ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(v.pos.x + camera.x, v.pos.y + camera.y);
    ctx.lineTo(x, y);
    ctx.stroke();
}


export function draw_circle(x: number, y: number, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "grey";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
}

export function draw_vertex(vertex: Vertex, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.beginPath();
    ctx.arc(vertex.pos.x + camera.x, vertex.pos.y + camera.y, 10, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "white";
    if (vertex.selected) { ctx.fillStyle = SELECTION_COLOR; }
    ctx.beginPath();
    ctx.arc(vertex.pos.x + camera.x, vertex.pos.y + camera.y, 8, 0, 2 * Math.PI);
    ctx.fill();


    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.beginPath();
    ctx.arc(vertex.pos.x + camera.x, vertex.pos.y + camera.y, 6, 0, 2 * Math.PI);
    ctx.fill();
}


// DRAW VERTICES
function draw_vertices(ctx: CanvasRenderingContext2D, g: Graph) {
    for (let vertex of g.vertices.values()) {
        draw_vertex(vertex, ctx);
    }
}

// DRAW EDGES
function draw_edges(ctx: CanvasRenderingContext2D, g: Graph) {
    for (let edge of g.edges) {
        let u = g.vertices.get(edge.start_vertex);
        let v = g.vertices.get(edge.end_vertex);

        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(u.pos.x + camera.x, u.pos.y + camera.y);
        ctx.lineTo(v.pos.x + camera.x, v.pos.y + camera.y);
        ctx.stroke();
    }
}


export function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Graph) {
    draw_background(canvas, ctx);
    draw_edges(ctx, g);
    draw_vertices(ctx, g);
}