import { Representation } from "gramoloss";
import { View } from "../camera";
import { CanvasVect } from "../vect";
import { CanvasCoord } from "../vertex";


export interface ClientRepresentation extends Representation {
    canvas_corner_top_left : CanvasCoord;
    canvas_corner_bottom_left : CanvasCoord;
    canvas_corner_bottom_right : CanvasCoord;
    canvas_corner_top_right : CanvasCoord;
    
    draw(ctx: CanvasRenderingContext2D, view: View);
    update_after_camera_change(view: View);
    click_over(pos: CanvasCoord, view: View): number | string ;
    translate_element_by_canvas_vect(index: number, cshift: CanvasVect, view: View);
    onmouseup(view: View);
    translate_by_canvas_vect(cshift: CanvasVect, view: View);
}
