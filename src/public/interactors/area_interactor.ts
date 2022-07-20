import { Interactor, DOWN_TYPE } from './interactor'
import { socket } from '../socket';
import { view } from '../camera';
import { AREA_CORNER, AREA_SIDE } from '../area';
import { CanvasCoord } from '../coord';
import { down_coord, last_down, last_down_index } from './interactor_manager';


export var interactor_area = new Interactor("area", "g", "area.svg", new Set([DOWN_TYPE.AREA, DOWN_TYPE.AREA_CORNER, DOWN_TYPE.AREA_SIDE]))

let is_creating_area : boolean;
let is_moving_area : boolean;
let first_corner : CanvasCoord;

let side_number: AREA_SIDE;
let corner_number: AREA_CORNER;


interactor_area.mousedown = (( canvas, ctx, g, e) => {
    const esc  = view.serverCoord2(e);
    if (last_down === DOWN_TYPE.EMPTY) {
        is_creating_area = true;
        first_corner = e;
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
    }
})

interactor_area.mousemove = ((canvas, ctx, g, e) => {
    // TODO: Animation
    const esc  = view.serverCoord2(e);
    if(is_creating_area){
        return true;
    }
    else if(is_moving_area){
        const moving_area = g.areas.get(last_down_index);
        if(side_number != null){
            moving_area.resize_side_area(esc, side_number)
        }
        else if(corner_number != null)
        {
            moving_area.resize_corner_area(esc, corner_number);
        } else if ( last_down == DOWN_TYPE.AREA){
            moving_area.translate(e.sub2(down_coord));
        }
        return true;
    }
    else{
        let cursor_changed = false;
    
        for (const a of g.areas.values()) {
            const corner_number = a.is_nearby_corner(e);
            const side_number = a.is_nearby_side(e, undefined, true);
            if(corner_number === AREA_CORNER.NONE && side_number === AREA_SIDE.NONE){
                continue;
            }
            else{
                cursor_changed = true;
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
    const esc  = view.serverCoord2(e);
    if (is_creating_area) {
        if (last_down === DOWN_TYPE.EMPTY) {
            if(first_corner.dist2(e) > 10){
                socket.emit("add_area", first_corner.x, first_corner.y, esc.x, esc.y, "G", null);
            }
            is_creating_area = false;
            first_corner = null;
        }
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
        socket.emit("area_translate", last_down_index, moved_area.corner_top_left, moved_area.corner_bottom_right);  
        is_moving_area = false;
    }
})


