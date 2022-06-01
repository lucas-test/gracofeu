class Vertex {
    pos: Coord;
    old_pos: Coord;
    selected: boolean;

    constructor(x: number, y: number) {
        this.pos = new Coord(x, y);
        this.old_pos = new Coord(x,y);
        this.selected = false;
    }

    dist2(x: number, y: number) {
        return (this.pos.x - x) ** 2 + (this.pos.y - y) ** 2
    }

    save_pos(){
        this.old_pos.x = this.pos.x;
        this.old_pos.y = this.pos.y;
    }

    update_pos_from_old(dx, dy){
        this.pos.x = this.old_pos.x + dx;
        this.pos.y = this.old_pos.y + dy;
    }


}