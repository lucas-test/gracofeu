import { Board } from "gramoloss";
import { DOWN_TYPE } from "../interactors/interactor";
import { interactor_loaded, key_states } from "../interactors/interactor_manager";
import { socket } from "../socket";
import { AREA_CORNER, AREA_SIDE, ClientArea } from "./area";
import { View } from "./camera";
import { ClientGraph } from "./graph";
import { ClientLink } from "./link";
import { ClientRepresentation } from "./representations/client_representation";
import { ClientStroke } from "./stroke";
import { ClientTextZone } from "./text_zone";
import { CanvasCoord, ClientVertex } from "./vertex";



export class ClientBoard extends Board<ClientVertex, ClientLink, ClientStroke, ClientArea, ClientTextZone, ClientRepresentation> {
    view: View;
    graph: ClientGraph;

    constructor(){
        super();
        this.graph = new ClientGraph();
        this.view = new View();
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (const rep of this.representations.values()){
            rep.draw(ctx, this.view);
        }
    }

    clear() {
        for( const text_zone of this.text_zones.values()){
            text_zone.div.remove();
        }
        this.text_zones.clear();
    }

    update_after_camera_change(){
        for ( const text_zone of this.text_zones.values()){
            text_zone.update_after_camera_change( this.view);
        }
        for (const rep of this.representations.values()){
            rep.update_after_camera_change(this.view);
        }
    }


    create_text_zone(canvas_pos: CanvasCoord): number{
        let index = 0;
        while (this.text_zones.has(index)) {
            index += 1;
        }
        const pos = this.view.create_server_coord(canvas_pos);
        const text_zone = new ClientTextZone(pos, 200, "salut", this.view, index);
        this.text_zones.set(index, text_zone);
        text_zone.div.onclick = (e) => {
            if( interactor_loaded.name == "text"){
                // validate_weight();
                this.display_text_zone_input(index);
            }
        }
        return index;
    }

    display_text_zone_input(index: number) {
        //current_index = index;
        // current_element_type = element_type;
        if (this.text_zones.has(index)){
            const text_zone = this.text_zones.get(index);
            const text_zone_input = document.getElementById("text_zone_input") as HTMLTextAreaElement;
            text_zone_input.style.width = String(text_zone.width) + "px";
            text_zone_input.style.height = String(text_zone.div.clientHeight) + "px";
            text_zone_input.value = text_zone.text.replace(/<br\s*\/?>/mg, "\n");
            text_zone_input.style.display = "block";
            text_zone_input.style.top = String(text_zone.canvas_pos.y) + "px";
            text_zone_input.style.left = String(text_zone.canvas_pos.x) + "px";
            window.setTimeout(() => text_zone_input.focus(), 0); // without timeout does not focus
            text_zone_input.onkeyup = (e) => {
                if (e.key == " "){
                    // socket.emit("update_text_text_zone", index, text_zone_input.value);
                    socket.emit("update_element", "TextZone", index, "text", text_zone_input.value);
                } 
                if (e.key == "Enter" && key_states.get("Control")) {
                    // text_zone.update_text(text_zone_input.value);
                    // socket.emit("update_text_text_zone", index, text_zone_input.value);
                    socket.emit("update_element", "TextZone", index, "text", text_zone_input.value);
                    text_zone_input.value = "";
                    text_zone_input.style.display = "none";
                    text_zone_input.blur();
                }else {
                    text_zone_input.style.height = "1px";
                    text_zone_input.style.height = String(text_zone_input.scrollHeight) + "px";
                }
            }
        }
        
    }


    get_element_nearby(pos: CanvasCoord, interactable_element_type: Set<DOWN_TYPE>) {
        const canvas_pos = this.view.create_canvas_coord(pos);

        if (interactable_element_type.has(DOWN_TYPE.REPRESENTATION_ELEMENT)){
            for (const [index, rep] of this.representations.entries()){
                const r = rep.click_over(pos, this.view);
                if (typeof r != "string"){
                    return { type: DOWN_TYPE.REPRESENTATION_ELEMENT, index: index, element_index: r};
                }
            }
        }

        if (interactable_element_type.has(DOWN_TYPE.VERTEX)) {
            for (const [index, v] of this.graph.vertices.entries()) {
                if (v.is_nearby(pos, 150)) {
                    return { type: DOWN_TYPE.VERTEX, index: index };
                }
            }
        }
       
        for (const [index, link] of this.graph.links.entries()) {
            if (interactable_element_type.has(DOWN_TYPE.CONTROL_POINT) && link.cp_canvas_pos.is_nearby(pos, 150)) {
                return { type: DOWN_TYPE.CONTROL_POINT, index: index };
            }
            if (interactable_element_type.has(DOWN_TYPE.LINK) && this.graph.is_click_over_link(index, pos, this.view)) {
                return { type: DOWN_TYPE.LINK, index: index };
            }
            if( interactable_element_type.has(DOWN_TYPE.LINK_WEIGHT) && pos.dist2(link.weight_position) <= 100){
                return { type: DOWN_TYPE.LINK_WEIGHT, index: index};
            }
        }

        for(const [index,a] of this.graph.areas.entries()){
            if(interactable_element_type.has(DOWN_TYPE.AREA) && a.is_nearby(pos)){
                return{ type: DOWN_TYPE.AREA, index: index };
            }
            const corner_index = a.is_nearby_corner(pos);
            console.log("CORNER INDEX", corner_index, corner_index!=0);
            if(interactable_element_type.has(DOWN_TYPE.AREA_CORNER) && corner_index != AREA_CORNER.NONE){
                return{ type: DOWN_TYPE.AREA_CORNER, index: index, corner: corner_index };
            }

            const side_index = a.is_nearby_side(pos, 5);
            if(interactable_element_type.has(DOWN_TYPE.AREA_SIDE) && side_index != AREA_SIDE.NONE){
                 return{ type: DOWN_TYPE.AREA_SIDE, index: index, side: side_index };
             }
        }

        if (interactable_element_type.has(DOWN_TYPE.STROKE)) {
            for(const [index,s] of this.graph.strokes.entries()){
                if(typeof s.is_nearby(pos, this.view) == "number"){     
                    return { type: DOWN_TYPE.STROKE, index: index };
                }
            }
        }

        if ( interactable_element_type.has(DOWN_TYPE.TEXT_ZONE)){
            for (const [index, text_zone] of this.text_zones.entries()){
                if ( text_zone.is_nearby(canvas_pos)){
                    return {type: DOWN_TYPE.TEXT_ZONE, index: index};
                }
            }
        }

        return { type: DOWN_TYPE.EMPTY, index: null };
    }

    // method change_camera -> update_canvas_pos de tous les éléments
}