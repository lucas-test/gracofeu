import { Area, Board, Coord, Graph, Link, Stroke, TextZone, Vect, Vertex } from "gramoloss";
import { DOWN_TYPE, RESIZE_TYPE } from "../interactors/interactor";
import { interactor_loaded, key_states } from "../interactors/interactor_manager";
import { GraphModifyer } from "../modifyers/modifyer";
import { local_board } from "../setup";
import { socket } from "../socket";
import { ClientArea } from "./area";
import { View } from "./camera";
import { ClientGraph } from "./graph";
import { ClientLink } from "./link";
import { ClientRectangle } from "./rectangle";
import { ClientRepresentation } from "./representations/client_representation";
import { is_click_over, resize_type_nearby, translate_by_canvas_vect } from "./resizable";
import { ClientStroke } from "./stroke";
import { ClientTextZone } from "./text_zone";
import { CanvasVect } from "./vect";
import { CanvasCoord, ClientVertex } from "./vertex";

export enum BoardElementType {
    Vertex = "Vertex",
    Link = "Link",
    ControlPoint = "ControlPoint",
    TextZone = "TextZone",
    Area = "Area",
    Stroke = "Stroke",
    Rectangle = "Rectangle",
    Representation = "Representation"
}

// These constants must correspond to the API of the server

export enum SocketMsgType {
    ADD_ELEMENT = "add_element",
    DELETE_ELEMENTS = "delete_elements",
    UPDATE_ELEMENT = "update_element",
    TRANSLATE_ELEMENTS = "translate_elements",
    RESIZE_ELEMENT = "resize_element",
    MERGE_VERTICES = "vertices_merge",
    PASTE_GRAPH = "paste_graph",
    APPLY_MODIFYER = "apply_modifyer",
    UNDO = "undo",
    REDO = "redo",
    LOAD_JSON = "load_json",
    GET_JSON = "get_json"
}



export class ClientBoard extends Board<ClientVertex, ClientLink, ClientStroke, ClientArea, ClientTextZone, ClientRepresentation, ClientRectangle> {
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

        for (const rect of this.rectangles.values()){
            rect.draw(ctx, this.view);
        }
    }

    clear() {
        for( const text_zone of this.text_zones.values()){
            text_zone.div.remove();
        }
        this.text_zones.clear();
    }

    update_after_camera_change(){
        for (const stroke of this.strokes.values()){
            stroke.update_after_camera_change(this.view);
        }
        for ( const text_zone of this.text_zones.values()){
            text_zone.update_after_camera_change(this.view);
        }
        for (const rep of this.representations.values()){
            rep.update_after_camera_change(this.view);
        }
        for (const rect of this.rectangles.values()){
            rect.update_after_camera_change(this.view);
        }
        for (const area of this.areas.values()){
            area.update_after_camera_change(this.view);
        }
    }

    select_elements_in_rect(corner1: CanvasCoord, corner2: CanvasCoord) {
        this.graph.select_vertices_in_rect(corner1, corner2);
        this.graph.select_links_in_rect(corner1, corner2);

        for (const stroke of this.strokes.values()){
            if (stroke.is_in_rect(corner1,corner2)){
                stroke.is_selected = true;   
            }
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
            if( interactor_loaded.id == "text"){
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
                    local_board.emit_update_element( BoardElementType.TextZone, index, "text", text_zone_input.value);
                } 
                if (e.key == "Enter" && key_states.get("Control")) {
                    local_board.emit_update_element(BoardElementType.TextZone, index, "text", text_zone_input.value);
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

        if (interactable_element_type.has(DOWN_TYPE.REPRESENTATION_ELEMENT)){
            for (const [index, rep] of this.representations.entries()){
                const resize_type = resize_type_nearby(rep, pos, 10);
                if (typeof resize_type != "number"){
                    return {type: DOWN_TYPE.RESIZE, element_type: "Representation", element: rep, index: index,  resize_type: resize_type};
                }
                const r = rep.click_over(pos, this.view);
                if (typeof r != "string"){
                    return { type: DOWN_TYPE.REPRESENTATION_ELEMENT, element_type: "Representation",  element: rep, index: index, element_index: r};
                }
            }
        }

        if (interactable_element_type.has(DOWN_TYPE.REPRESENTATION)){
            for (const [index, rep] of this.representations.entries()){
                if ( is_click_over(rep, pos)){
                    return { type: DOWN_TYPE.REPRESENTATION,  element: rep, index: index};
                }
            }
        }

        if (interactable_element_type.has(DOWN_TYPE.RECTANGLE)){
            for (const [index, rect] of this.rectangles.entries()){
                const resize_type = resize_type_nearby(rect, pos, 10);
                if (typeof resize_type != "number"){
                    return {type: DOWN_TYPE.RESIZE, element_type: "Rectangle", element: rect, index: index,  resize_type: resize_type};
                }
            }
            
            for (const [index, rect] of this.rectangles.entries()){
                if ( is_click_over(rect, pos)){
                    return { type: DOWN_TYPE.RECTANGLE,  element: rect, index: index};
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
            if (interactable_element_type.has(DOWN_TYPE.CONTROL_POINT) && typeof link.cp_canvas_pos != "string" && link.cp_canvas_pos.is_nearby(pos, 150)) {
                return { type: DOWN_TYPE.CONTROL_POINT, index: index };
            }
            if (interactable_element_type.has(DOWN_TYPE.LINK) && this.graph.is_click_over_link(index, pos, this.view)) {
                return { type: DOWN_TYPE.LINK, index: index };
            }
            if( interactable_element_type.has(DOWN_TYPE.LINK_WEIGHT) && pos.dist2(link.weight_position) <= 100){
                return { type: DOWN_TYPE.LINK_WEIGHT, index: index};
            }
        }

        if(interactable_element_type.has(DOWN_TYPE.RESIZE)){
            for (const [index, area] of this.areas.entries()){
                const resize_type = resize_type_nearby(area, pos, 10);
                if (typeof resize_type != "number"){
                    return {type: DOWN_TYPE.RESIZE, element_type: "Area", element: area, index: index,  resize_type: resize_type};
                }
            }
        }        

        for(const [index,a] of this.areas.entries()){
            if(interactable_element_type.has(DOWN_TYPE.AREA) && is_click_over(a,pos)){
                return{ type: DOWN_TYPE.AREA, element: a, index: index };
            }
        }

        if (interactable_element_type.has(DOWN_TYPE.STROKE)) {
            for(const [index,s] of this.strokes.entries()){
                if(typeof s.is_nearby(pos, this.view) == "number"){     
                    return { type: DOWN_TYPE.STROKE, index: index };
                }
            }
        }

        if ( interactable_element_type.has(DOWN_TYPE.TEXT_ZONE)){
            for (const [index, text_zone] of this.text_zones.entries()){
                if ( text_zone.is_nearby(pos)){
                    return {type: DOWN_TYPE.TEXT_ZONE, index: index};
                }
            }
        }

        return { type: DOWN_TYPE.EMPTY, index: null };
    }

    deselect_all_strokes() {
        this.strokes.forEach(s => {
            s.is_selected = false;
        });
    }


    clear_all_selections() {
        this.graph.deselect_all_vertices();
        this.graph.deselect_all_links();
        this.deselect_all_strokes();
    }

    update_canvas_pos(view: View) {
        for (const v of this.graph.vertices.values()) {
            v.update_after_view_modification(view);
        }
        for (const link of this.graph.links.values()) {
            link.update_after_view_modification(view);
        }
        // for (const area of this.areas.values()){
        //     area.update_canvas_pos(view);
        // }
        for( const stroke of this.strokes.values()){
            stroke.update_canvas_pos(view);
        }
        this.graph.set_automatic_weight_positions();
    }

    translate_area(shift: CanvasVect, area_index: number, vertices_contained: Set<number>){
        if( this.areas.has(area_index)){
            const area = this.areas.get(area_index);
            this.graph.vertices.forEach((vertex, vertex_index) => {
                if (vertices_contained.has(vertex_index)){
                    vertex.translate_by_canvas_vect(shift, this.view);
                }
            })
            for( const link of this.graph.links.values()){
                if ( typeof link.cp != "string"){
                    const v1 = this.graph.vertices.get(link.start_vertex);
                    const v2 = this.graph.vertices.get(link.end_vertex);
                    if(vertices_contained.has(link.start_vertex) && vertices_contained.has(link.end_vertex)){
                        link.translate_cp_by_canvas_vect(shift, this.view);
                    }
                    else if(vertices_contained.has(link.start_vertex)){ // and thus not v2
                        const new_pos = v1.pos;
                        const previous_pos = this.view.create_server_coord_from_subtranslated(v1.canvas_pos, shift);
                        const fixed_pos = v2.pos;
                        link.transform_cp(new_pos, previous_pos, fixed_pos);
                        link.cp_canvas_pos = this.view.create_canvas_coord(link.cp);
                    }else if(vertices_contained.has(link.end_vertex)) { // and thus not v1
                        const new_pos = v2.pos;
                        const previous_pos = this.view.create_server_coord_from_subtranslated(v2.canvas_pos, shift);
                        const fixed_pos = v1.pos;
                        link.transform_cp(new_pos, previous_pos, fixed_pos);
                        link.cp_canvas_pos = this.view.create_canvas_coord(link.cp);
                    }
                }
            }
            translate_by_canvas_vect(area, shift, this.view);
        }
    }


    emit_redo() {
        socket.emit(SocketMsgType.REDO);
    }

    emit_undo() {
        socket.emit(SocketMsgType.UNDO);
    }

    emit_translate_elements(indices: Array<[BoardElementType,number]>, shift: Vect){
        socket.emit(SocketMsgType.TRANSLATE_ELEMENTS, indices, shift);
    }

    emit_delete_elements(indices: Array<[BoardElementType,number]>){
        socket.emit(SocketMsgType.DELETE_ELEMENTS, indices);
    }

    emit_update_element(type: BoardElementType, index: number, attribute: string, value: any){
        socket.emit(SocketMsgType.UPDATE_ELEMENT, type, index, attribute, value);
    }

    emit_vertices_merge(index1: number, index2: number){
        socket.emit(SocketMsgType.MERGE_VERTICES, index1, index2);
    }

    emit_paste_graph(graph: Graph<Vertex, Link>){
        socket.emit(SocketMsgType.PASTE_GRAPH, [...graph.vertices.entries()], [...graph.links.entries()]);
    }

    emit_resize_element(type: BoardElementType, index: number, pos: Coord, resize_type: RESIZE_TYPE){
        socket.emit(SocketMsgType.RESIZE_ELEMENT, type, index, pos.x, pos.y, resize_type);
    }

    emit_apply_modifyer(modifyer: GraphModifyer){
        const attributes_data = new Array<string | number>();
        for (const attribute of modifyer.attributes){
            attributes_data.push(attribute.value);
        }
        socket.emit(SocketMsgType.APPLY_MODIFYER, modifyer.name, attributes_data);
    }

    // Note: sometimes element is a server class, sometimes a client
    // Normally it should be only server
    // TODO: improve that
    emit_add_element(element: Vertex | Link | ClientStroke | Area | TextZone, callback: (response: number) => void  ){
        switch(element.constructor){
            case Vertex: {
                const vertex = element as Vertex;
                socket.emit(SocketMsgType.ADD_ELEMENT, BoardElementType.Vertex, {pos: vertex.pos}, callback);
                break;
            }
            case Link: {
                const link = element as Link;
                socket.emit(SocketMsgType.ADD_ELEMENT, BoardElementType.Link, {start_index: link.start_vertex, end_index: link.end_vertex, orientation: link.orientation}, callback);
                break;
            }
            case ClientStroke: {
                const stroke = element as ClientStroke;
                socket.emit(SocketMsgType.ADD_ELEMENT , BoardElementType.Stroke, {points: [... stroke.positions.entries()], color: stroke.color, width: stroke.width}, callback);
                break;
            }
            case TextZone: {
                const text_zone = element as TextZone;
                socket.emit(SocketMsgType.ADD_ELEMENT, BoardElementType.TextZone, {pos: text_zone.pos}, callback);
                break;
            }
            case Area: {
                const area = element as Area;
                socket.emit(SocketMsgType.ADD_ELEMENT, BoardElementType.Area, {c1: area.c1, c2: area.c2, label: area.label, color: area.color }, callback);
                break;
            }
        }
    }

    // method change_camera -> update_canvas_pos de tous les éléments
}