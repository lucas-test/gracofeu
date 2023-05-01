import { Area, Board, Coord, Graph, Link, Stroke, TextZone, Vect, Vertex } from "gramoloss";
import { GRID_COLOR } from "../draw";
import { DOWN_TYPE, RESIZE_TYPE } from "../interactors/interactor";
import { GraphModifyer } from "../modifyers/modifyer";
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

    /**
     * Draw a triangular grid. 
     * The length of the equilateral triangle is `grid_size` of view.
     * @param canvas The sidebar the item belongs
     * @param ctx The ctx of the canvas
     */
    draw_triangular_grid(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        const grid_size = this.view.grid_size;
        const h = grid_size*Math.sqrt(3)/2;

        //   \ diagonals
        for (let x = (this.view.camera.x - this.view.camera.y/Math.sqrt(3)) % grid_size - Math.floor((canvas.width+canvas.height)/grid_size)*grid_size; x < canvas.width; x += grid_size) {
            ctx.beginPath();
            ctx.strokeStyle = GRID_COLOR;
            ctx.lineWidth = 1;
            ctx.moveTo(x, 0);
            ctx.lineTo(x + canvas.height , canvas.height*Math.sqrt(3));
            ctx.stroke();
        }

        //   / diagonals
        for (let x = (this.view.camera.x + this.view.camera.y/Math.sqrt(3)) % grid_size + Math.floor((canvas.width+canvas.height)/grid_size)*grid_size; x > 0 ; x -= grid_size) {
            ctx.beginPath();
            ctx.strokeStyle = GRID_COLOR;
            ctx.lineWidth = 1;
            ctx.moveTo(x, 0);
            ctx.lineTo(x - canvas.height , canvas.height*Math.sqrt(3));
            ctx.stroke();
        }

        // horizontal lines
        for (let y = this.view.camera.y % h; y < canvas.height; y += h) {
            ctx.beginPath();
            ctx.strokeStyle = GRID_COLOR;
            ctx.lineWidth = 1;
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // debugging : draw the quadrilateral containing the point

        // for (let i = 0 ; i < 10 ; i ++){
        //     for (let j = 0 ; j < 10 ; j ++){
        //         let pos = new Coord(i*grid_size + j*grid_size/2, Math.sqrt(3)*j*grid_size/2);
        //         pos = pos.add(this.view.camera);
        //         let cpos = new CanvasCoord(pos.x, pos.y);
        //         draw_circle(cpos, "red", 10, 1, ctx);
        //     }
        // }


        // const px = ((mouse_pos.x - this.view.camera.x) - (mouse_pos.y - this.view.camera.y)/Math.sqrt(3))/grid_size;
        // const py = (mouse_pos.y - this.view.camera.y)/h;
        // const i = Math.floor(px);
        // const j = Math.floor(py);

        // let pos = new Coord(i*grid_size + j*grid_size/2, Math.sqrt(3)*j*grid_size/2);
        // pos = pos.add(this.view.camera);
        // let cpos = new CanvasCoord(pos.x, pos.y);
        // draw_circle(cpos, "blue", 10, 1, ctx);

        // let pos2 = new Coord((i+1)*grid_size + (j+1)*grid_size/2, Math.sqrt(3)*(j+1)*grid_size/2);
        // pos2 = pos2.add(this.view.camera);
        // let cpos2 = new CanvasCoord(pos2.x, pos2.y);
        // draw_circle(cpos2, "blue", 10, 1, ctx);


    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.view.display_triangular_grid){
            this.draw_triangular_grid(document.getElementById("main") as HTMLCanvasElement, ctx);
        }
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
        return index;
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