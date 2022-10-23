import { Coord } from "./coord";

export class Stroke {
    positions: Array<Coord>;
    color: string;
    width: number;
    top_left: Coord;
    bot_right: Coord;

    constructor(positions: any, color: string, width: number, top_left: Coord, bot_right: Coord) {
        this.positions = positions;
        this.color = color;
        this.width = width;
        this.top_left = top_left;
        this.bot_right = bot_right;
    }

    translate(shift: Coord) {
        for (const pos of this.positions.values()) {
            pos.translate(shift);
        }
    }

    rtranslate(shift: Coord) {
        for (const pos of this.positions.values()) {
            pos.rtranslate(shift);
        }
    }
}