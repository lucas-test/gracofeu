import { Representation } from "gramoloss";
import { View } from "../camera";
import { CanvasVect } from "../vect";
import { CanvasCoord } from "../vertex";


export interface ClientRepresentation extends Representation {
    draw(ctx: CanvasRenderingContext2D, view: View);
    update_after_camera_change(view: View);
    click_over(pos: CanvasCoord, view: View): number | string ;
    translate_element_by_canvas_vect(index: number, cshift: CanvasVect, view: View);
    onmouseup(view: View);
}