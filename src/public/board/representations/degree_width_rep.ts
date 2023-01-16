import { Coord, DegreeWidthRep, ORIENTATION } from "gramoloss";
import { draw_circle } from "../../draw_basics";
import { local_board } from "../../setup";
import { View } from "../camera";
import { ClientGraph } from "../graph";
import { CanvasVect } from "../vect";
import { CanvasCoord } from "../vertex";

export class ClientDegreeWidthRep extends DegreeWidthRep {
    canvas_corner_top_left : CanvasCoord;
    canvas_corner_bottom_left : CanvasCoord;
    canvas_corner_bottom_right : CanvasCoord;
    canvas_corner_top_right : CanvasCoord;

    constructor(g: ClientGraph, c1: Coord, c2: Coord, view: View){
        super(g,c1,c2);
        this.canvas_corner_top_left = view.create_canvas_coord(this.top_left_corner());
        this.canvas_corner_bottom_left = view.create_canvas_coord(this.bot_left_corner());
        this.canvas_corner_bottom_right = view.create_canvas_coord(this.bot_right_corner());
        this.canvas_corner_top_right = view.create_canvas_coord(this.top_right_corner());
    }

    static from_embedding(g: ClientGraph, view: View): ClientDegreeWidthRep{
        if ( g.vertices.size > 0){
            let minX = NaN;
            let maxX = NaN;
            let minY = NaN;
            let maxY = NaN;
            for (const vertex of g.vertices.values()){
                if ( isNaN(minX)){
                    minX = vertex.pos.x;
                    maxX = vertex.pos.x;
                    minY = vertex.pos.y;
                    maxY = vertex.pos.y;
                }else {
                    minX = Math.min(minX, vertex.pos.x );
                    maxX = Math.max(maxX, vertex.pos.x );
                    minY = Math.min(minY, vertex.pos.y );
                    maxY = Math.max(maxY, vertex.pos.y );
                }
            }
            const w = 20 + maxX - minX;
            minX += w;
            maxX += w;
            return new ClientDegreeWidthRep(g, new Coord(minX, minY), new Coord(maxX, maxY), view);
        } else {
            return new ClientDegreeWidthRep(g, new Coord(0, 0), new Coord(100, 100), view);
        }
    }

    draw(ctx: CanvasRenderingContext2D, view: View){
        const y = (this.c1.y + this.c2.y)/2;

        // draw border
        ctx.beginPath();
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        const c1canvas = this.canvas_corner_top_left;
        const c2canvas = this.canvas_corner_bottom_right;
        ctx.rect(c1canvas.x , c1canvas.y, c2canvas.x - c1canvas.x, c2canvas.y - c1canvas.y);
        ctx.stroke();

        // draw rect fill
        ctx.globalAlpha = 0.07;
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // draw arcs
        for (const [index1, x1] of this.x.entries()){
            const canvas_coord1 = view.create_canvas_coord(new Coord(x1,y));
            for (const [index2, x2] of this.x.entries()){
                if (x1 < x2){
                    const canvas_coord2 = view.create_canvas_coord(new Coord(x2,y));
                    const xmiddle = (canvas_coord1.x + canvas_coord2.x)/2;
                    if (local_board.graph.has_link(index2, index1, ORIENTATION.DIRECTED)){
                        ctx.beginPath();
                        ctx.moveTo(canvas_coord1.x, canvas_coord1.y);
                        ctx.lineWidth = 3;
                        ctx.quadraticCurveTo(xmiddle, canvas_coord1.y - 50, canvas_coord2.x, canvas_coord2.y);
                        ctx.stroke();
                    } 
                }
            }
        }

        // draw points
        for (const [index, x] of this.x.entries()){
            const canvas_coord = view.create_canvas_coord(new Coord(x,y));
            draw_circle(canvas_coord, "black", 14, 1, ctx);
            draw_circle(canvas_coord, "blue", 12, 1, ctx);
            draw_circle(canvas_coord, "black", 10, 1, ctx);
            ctx.font = "17px Arial";
            const measure = ctx.measureText(String(index));
            ctx.fillStyle = "white";
            ctx.fillText(String(index), canvas_coord.x - measure.width / 2, canvas_coord.y+ 5);
        }

        // compute dw
        let dw = 0;
        for (const [index1, x1] of this.x.entries()){
            let dwc = 0;
            for (const [index2, x2] of this.x.entries()){
                if (index1 != index2){
                    if (x1 < x2 && local_board.graph.has_link(index2,index1, ORIENTATION.DIRECTED)){
                        dwc += 1;
                    } else if (x2 < x1 && local_board.graph.has_link(index1,index2, ORIENTATION.DIRECTED)){
                        dwc += 1;
                    } 
                }
            }
            if (dwc > dw){
                dw = dwc;
            }
        }

        // draw dw
        for (const [index1, x1] of this.x.entries()){
            let dwc = 0;
            for (const [index2, x2] of this.x.entries()){
                if (index1 != index2){
                    if (x1 < x2 && local_board.graph.has_link(index2,index1, ORIENTATION.DIRECTED)){
                        dwc += 1;
                    } else if (x2 < x1 && local_board.graph.has_link(index1,index2, ORIENTATION.DIRECTED)){
                        dwc += 1;
                    } 
                }
            }
            ctx.font = "17px Arial";
            const measure = ctx.measureText(String(dwc));
            const pos = view.create_canvas_coord(new Coord(x1,y));
            if (dwc == dw){
                draw_circle(new CanvasCoord(pos.x, pos.y + 25), "red", 10, 0.5, ctx);
            }
            if ( view.dark_mode){
                ctx.fillStyle = "white";
            } else {
                ctx.fillStyle = "black";
            }
            ctx.fillText(String(dwc), pos.x - measure.width / 2, pos.y + 30);
        }
    }

    update_after_camera_change(view: View){
        this.canvas_corner_top_left = view.create_canvas_coord(this.top_left_corner());
        this.canvas_corner_bottom_left = view.create_canvas_coord(this.bot_left_corner());
        this.canvas_corner_bottom_right = view.create_canvas_coord(this.bot_right_corner());
        this.canvas_corner_top_right = view.create_canvas_coord(this.top_right_corner());
    }

    click_over(pos: CanvasCoord, view: View): number | string {
        const y = (this.c1.y + this.c2.y)/2;
        for ( const [index, x] of this.x.entries()){
            const canvas_coord = view.create_canvas_coord(new Coord(x,y));
            if (canvas_coord.is_nearby(pos, 200)){
                return index;
            }
        }
        return "";
    }

    translate_element_by_canvas_vect(index: number, cshift: CanvasVect, view: View){
        const shift = view.server_vect(cshift);
        this.x.set(index, this.x.get(index) + shift.x);
    }

    translate_by_canvas_vect(cshift: CanvasVect, view: View){
        const shift = view.server_vect(cshift);
        for (const [index, x] of this.x.entries()){
            this.x.set(index, this.x.get(index) + shift.x)
        }
    }

    onmouseup(view: View){
        this.distribute();
    }
}