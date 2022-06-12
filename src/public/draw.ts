const SELECTION_COLOR = 'green' // avant c'était '#00ffff'
const COLOR_BACKGROUND = "#1e1e1e";
const GRID_COLOR = '#777777';

import { Coord } from '../server/coord';
import { Vertex } from '../server/vertex';
import { Edge } from '../server/edge';
import { Graph } from '../server/graph';
import { camera, view } from './camera';
import { User, users } from './user';
import { local_vertices } from './local_graph';

export function draw_background(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();

    if (view.grid_show) {
        for (let i = camera.x % view.grid_size; i < canvas.width; i += view.grid_size) {
            ctx.strokeStyle = GRID_COLOR;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }

        for (let i = camera.y % view.grid_size; i < canvas.height; i += view.grid_size) {
            ctx.strokeStyle = GRID_COLOR;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
    }
}

export function draw_line(start: Coord, end: Coord, ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(start.x + camera.x, start.y + camera.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}


export function draw_circle(center: Coord, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "grey";
    ctx.beginPath();
    ctx.arc(center.x, center.y, 10, 0, 2 * Math.PI);
    ctx.fill();
}

export function draw_vertex(index: number, g: Graph, ctx: CanvasRenderingContext2D) {
    const vertex = local_vertices.get(index);

    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.beginPath();
    ctx.arc(vertex.pos.x + camera.x, vertex.pos.y + camera.y, 10, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "white";

    if (local_vertices.get(index).is_selected) { ctx.fillStyle = SELECTION_COLOR; }
    ctx.beginPath();
    ctx.arc(vertex.pos.x + camera.x, vertex.pos.y + camera.y, 8, 0, 2 * Math.PI);
    ctx.fill();


    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.beginPath();
    ctx.arc(vertex.pos.x + camera.x, vertex.pos.y + camera.y, 6, 0, 2 * Math.PI);
    ctx.fill();
}

export function draw_user(user: User, ctx: CanvasRenderingContext2D) {
    ctx.font = "15px serif";
    ctx.beginPath();
    ctx.fillStyle = user.color;
    let text = ctx.measureText(user.label);
    ctx.rect(user.pos.x + camera.x - 5, user.pos.y + camera.y - 17, text.width + 10, 19);
    ctx.fill();


    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.fillText(user.label, user.pos.x + camera.x, user.pos.y + camera.y);
    ctx.fill();
}

// DRAW USERS
function draw_users(ctx: CanvasRenderingContext2D) {
    users.forEach(user => {
        draw_user(user, ctx);
    });
}


// DRAW VERTICES
function draw_vertices(ctx: CanvasRenderingContext2D, g: Graph) {
    for (const index of local_vertices.keys()) {
        draw_vertex(index, g, ctx);
    }
}

// DRAW EDGES
function draw_edges(ctx: CanvasRenderingContext2D, g: Graph) {
    for (let edge of g.edges) {
        let u = local_vertices.get(edge.start_vertex);
        let v = local_vertices.get(edge.end_vertex);

        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(u.pos.x + camera.x, u.pos.y + camera.y);
        ctx.lineTo(v.pos.x + camera.x, v.pos.y + camera.y);
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
}