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

    constructor(x: number, y: number){
        this.pos = new Coord(x,y)
    }

    draw(ctx: CanvasRenderingContext2D){
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 8, 0, 2 * Math.PI);
        ctx.fill();
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
    }
}

