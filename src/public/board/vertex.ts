import { local_board } from "../setup";
import { CanvasCoord, ServerCoord } from "./coord";


export class LocalVertex {
    // server attributes:
    pos: ServerCoord;
    color: string;

    // local attributes:
    is_selected: boolean;
    old_pos: ServerCoord;
    index_string: string;
    canvas_pos: CanvasCoord;

    constructor(pos: ServerCoord) {
        this.pos = new ServerCoord(pos.x, pos.y); // this.pos = pos; does not copy the methods of Coord ...
        this.old_pos = new ServerCoord(pos.x, pos.y);
        this.is_selected = false;
        this.index_string = "";
        this.color = "black";
        this.canvas_pos = local_board.view.canvasCoord(pos);
    }

    save_pos() {
        this.old_pos.x = this.pos.x;
        this.old_pos.y = this.pos.y;
    }


    is_nearby(pos: CanvasCoord, r: number) {
        return this.canvas_pos.dist2(pos) <= r;
    }

    is_in_rect(c1: CanvasCoord, c2: CanvasCoord) {
        const canvas_pos = this.canvas_pos;
        if (c1.x <= c2.x && c1.y <= c2.y) {
            return (c1.x <= canvas_pos.x && canvas_pos.x <= c2.x && c1.y <= canvas_pos.y && canvas_pos.y <= c2.y)
        } else if (c1.x <= c2.x && c2.y <= c1.y) {
            return (c1.x <= canvas_pos.x && canvas_pos.x <= c2.x && c2.y <= canvas_pos.y && canvas_pos.y <= c1.y)
        } else if (c2.x <= c1.x && c2.y <= c1.y) {
            return (c2.x <= canvas_pos.x && canvas_pos.x <= c1.x && c2.y <= canvas_pos.y && canvas_pos.y <= c1.y)
        } else if (c2.x <= c1.x && c1.y <= c2.y) {
            return (c2.x <= canvas_pos.x && canvas_pos.x <= c1.x && c1.y <= canvas_pos.y && canvas_pos.y <= c2.y)
        }
    }

    get_tikz_coordinate(index: number) {
        return `v${index}`;
    }
    tikzify_coordinate(index: number) {
        return `\\coordinate (${this.get_tikz_coordinate(index)}) at (${Math.round(this.pos.x)/100}, ${Math.round(this.pos.y)/100});`;
    }

    tikzify_node(index: number) {
        // const c = "c" + COLORS.indexOf(this.color);
        // if (this.color == DEFAULT_COLOR) {
        //   c = "white";
        // }

        return `\\node[scale = \\scaleV, nodes={white}{}{}{}] at  (${this.get_tikz_coordinate(index)})  {};`;
    }

    tikzify_label() {
        // TODO
        let labelCode = "";
        // https://tex.stackexchange.com/questions/58878/tikz-set-node-label-position-more-precisely
        // shift={(1,0.3)} COMMENT 2

        // labelCode = "\\node[shift={(" + round(this.label.getExactLabelOffsetX() * 10) / 1000 + "," + -round(this.label.getExactLabelOffsetY() * 10) / 1000 + ")}, scale=\\scaleV] at  (v" + Vertices.indexOf(this) + ") {" + this.label.text + "};";

        return labelCode;
    }

}
