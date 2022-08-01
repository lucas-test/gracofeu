import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import { Area, AREA_CORNER, AREA_SIDE } from '../board/area';
import { ServerCoord } from '../board/coord';
import { down_coord, last_down, last_down_index } from './interactor_manager';
import { local_board } from '../setup';


export var interactor_area = new Interactor("area", "g", "area.svg", new Set([DOWN_TYPE.AREA, DOWN_TYPE.AREA_CORNER, DOWN_TYPE.AREA_SIDE]))

let is_creating_area : boolean;
let last_created_area_index: number = null;
let is_moving_area : boolean;
let first_corner : ServerCoord;

let side_number: AREA_SIDE;
let corner_number: AREA_CORNER;
let vertices_contained = new Set<number>();


interactor_area.mousedown = (( canvas, ctx, g, e) => {
    if (last_down === DOWN_TYPE.EMPTY) {
        is_creating_area = true;
        first_corner = local_board.view.serverCoord2(e);
        socket.emit("add_area", first_corner.x, first_corner.y, first_corner.x, first_corner.y, "G", "", 
        (response: number) => { last_created_area_index = response });
    } else if (last_down === DOWN_TYPE.AREA_CORNER){
        const area = g.areas.get(last_down_index);
        corner_number = area.is_nearby_corner(e);
        is_moving_area = true;
    } else  if (last_down === DOWN_TYPE.AREA_SIDE){
        const area = g.areas.get(last_down_index);
        side_number = area.is_nearby_side(e);
        is_moving_area = true;
    } else if ( last_down == DOWN_TYPE.AREA){
        is_moving_area = true;
        const area = g.areas.get(last_down_index);
        area.save_canvas_pos();
        vertices_contained = g.vertices_contained_by_area(area);
        g.vertices.forEach((vertex, vertex_index)=> {
            if( vertices_contained.has(vertex_index)){
                vertex.save_pos();
            }
        })
        for (var link of g.links.values()) {
            if(vertices_contained.has(link.start_vertex) || vertices_contained.has(link.end_vertex)){
                link.save_pos();
            }
        }
    }
})

interactor_area.mousemove = ((canvas, ctx, g, e) => {

    if(is_creating_area){
        if( last_created_area_index != null && g.areas.has(last_created_area_index)){
            const last_created_area = g.areas.get(last_created_area_index);
            last_created_area.resize_corner_area(e, AREA_CORNER.TOP_RIGHT, local_board.view);
        }
        return true;
    }
    else if(is_moving_area){
        const moving_area = g.areas.get(last_down_index);
        if(side_number != null){
            moving_area.resize_side_area(e, side_number, local_board.view)
        }
        else if(corner_number != null)
        {
            moving_area.resize_corner_area(e, corner_number, local_board.view);
        } else if ( last_down == DOWN_TYPE.AREA){
            g.translate_area(e.sub2(down_coord), last_down_index, vertices_contained);
        }
        return true;
    }
    else{
        let cursor_changed = false;
    
        for (const a of g.areas.values()) {
            const corner_number = a.is_nearby_corner(e);
            const side_number = a.is_nearby_side(e, undefined, true);
            const is_on_label = a.is_nearby(e);

            if(corner_number === AREA_CORNER.NONE && side_number === AREA_SIDE.NONE && !is_on_label){
                continue;
            }
            else{
                cursor_changed = true;
            }

            if(is_on_label){
                document.body.style.cursor="grab";
                break;
            }

            if(corner_number === AREA_CORNER.TOP_LEFT || corner_number === AREA_CORNER.BOT_RIGHT)
            {
                document.body.style.cursor = "nw-resize";
                break;
            }
            if(corner_number === AREA_CORNER.TOP_RIGHT)
            {
                document.body.style.cursor = "sw-resize";
                break;
            }
            // if(corner_number === AREA_CORNER.BOT_LEFT)
            // {
            //     document.body.style.cursor = "ne-resize";
            //     break;
            // }
    
            if(side_number === AREA_SIDE.TOP || side_number === AREA_SIDE.BOT)
            {
                document.body.style.cursor = "n-resize";
                break;
            }
            if(side_number === AREA_SIDE.LEFT || side_number === AREA_SIDE.RIGHT)
            {
                document.body.style.cursor = "w-resize";
                break;
            }
    
    
        }
        if(!cursor_changed){
            document.body.style.cursor = "default";
        }
        
        return false;
    }
   
   
})

interactor_area.mouseup = ((canvas, ctx, g, e) => {
    const esc  = local_board.view.serverCoord2(e);
    if (last_down === DOWN_TYPE.EMPTY) {
        socket.emit("area_move_corner", last_created_area_index, esc.x, esc.y, AREA_CORNER.TOP_RIGHT);
        is_creating_area = false;
        first_corner = null;
    }
    else if (last_down === DOWN_TYPE.AREA_SIDE){
        socket.emit("area_move_side", last_down_index, esc.x, esc.y, side_number);      
        side_number = null;
        is_moving_area = false;
    }
    else if (last_down === DOWN_TYPE.AREA_CORNER){
        socket.emit("area_move_corner", last_down_index, esc.x, esc.y, corner_number);  
        corner_number = null;
        is_moving_area = false;
    }
    else if ( last_down == DOWN_TYPE.AREA){
        const moved_area = g.areas.get(last_down_index);
        const data_socket_vertices = new Array();
        g.vertices.forEach((vertex, index) => {
            if (vertices_contained.has(index)) {
                data_socket_vertices.push({ index: index, x: vertex.pos.x, y: vertex.pos.y });
            }
        })
        const data_socket_links = new Array();
        g.links.forEach((link, index) => {
            if(vertices_contained.has(link.start_vertex) || vertices_contained.has(link.end_vertex)){
                data_socket_links.push({index: index, cp: link.cp })
            }
        });
        socket.emit("area_translate", last_down_index, moved_area.corner_top_left, moved_area.corner_bottom_right);  
        is_moving_area = false;
        socket.emit("update_control_points", data_socket_links);
        socket.emit("update_positions", data_socket_vertices);
    }
})


