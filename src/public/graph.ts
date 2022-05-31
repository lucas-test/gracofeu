class Coord {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    
}

class Vertex {
    pos: Coord;
    selected: boolean;

    constructor(x: number, y: number){
        this.pos = new Coord(x,y)
        this.selected = false;
    }

    draw(ctx: CanvasRenderingContext2D){
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 8, 0, 2 * Math.PI);
        ctx.fill();
    }

    dist2(x: number, y:number){
        return  (this.pos.x - x)**2 + (this.pos.y-y)**2
    }
}


class Graph {
    vertices: Map<number,Vertex>;
    
    constructor(){
        this.vertices = new Map();
    }

    add_vertex(x: number, y:number){
        let index = 0;
        while ( this.vertices.has(index)){
            index += 1;
        }
        this.vertices.set(index, new Vertex(x,y));
        return index;
    }
}

