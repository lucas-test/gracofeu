import { view } from "./camera";
import { CanvasCoord, Coord, ServerCoord } from "./local_graph";

export class Stroke{
    positions:Array<ServerCoord>;
    old_pos:ServerCoord;
    color:string;
    width:number;
    top_left: ServerCoord;
    bot_right: ServerCoord;
    is_selected:boolean;
    
    constructor(pos:Array<ServerCoord>, color:string, width:number){
        this.positions = pos;
        this.color = color;
        this.width = width;
        this.is_selected = false;
        if(pos.length>0){
            this.old_pos = new ServerCoord(pos[0].x, pos[0].y);
            this.top_left = new ServerCoord(pos[0].x, pos[0].y);
            this.bot_right = new ServerCoord(pos[0].x, pos[0].y);
            for(let i = 1; i<pos.length; i++){
                this.bot_right.x = Math.max(pos[i].x, this.bot_right.x);
                this.top_left.x = Math.min(pos[i].x, this.top_left.x);
                this.bot_right.y = Math.max(pos[i].y, this.bot_right.y);
                this.top_left.y = Math.min(pos[i].y, this.top_left.y);
            }
        }
        else{
            this.old_pos = null;
            this.top_left = null;
            this.bot_right = null;
        }
    }

    is_nearby(pos:CanvasCoord, r:number){
        const server_pos = view.serverCoord2(pos);
        if (server_pos.x > this.bot_right.x || server_pos.x < this.top_left.x || server_pos.y > this.bot_right.y || server_pos.y < this.top_left.y)
        {
            return false;
        }

        for(let i = 0; i<this.positions.length; i++){
            // TODO: Next to the LINE between the two last instead of checking the vertices only.
            if(server_pos.dist2(this.positions[i]) <= r){
                return i;
            }
        }

        return false;
    }


    push(pos:ServerCoord){
        this.positions.push(pos);
        this.bot_right.x = Math.max(pos.x, this.bot_right.x);
        this.top_left.x = Math.min(pos.x, this.top_left.x);
        this.bot_right.y = Math.max(pos.y, this.bot_right.y);
        this.top_left.y = Math.min(pos.y, this.top_left.y);
    }

}