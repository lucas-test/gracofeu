// INTERACTOR EDGE

var index_last_created_vertex = null; // est ce qu'on peut pas intégrer ça dans interactor_edge directement ?


var interactor_edge = new Interactor("edge", "e", "edition.svg");

interactor_edge.mousedown = ((d, k, canvas, ctx, g, e) => {

    if (d == DOWN_TYPE.EMPTY) {
        let index = g.add_vertex(e.pageX, e.pageY);
        index_last_created_vertex = index;
    }
    if (d === DOWN_TYPE.VERTEX_NON_SELECTED || d === DOWN_TYPE.VERTEX_SELECTED) {
        console.log(k);
    }


})

interactor_edge.mousemove = ((canvas, ctx, g, e) => {
    console.log("mousemove " , interactor_edge.last_down);
    if (interactor_edge.last_down == DOWN_TYPE.EMPTY ) {
        let vertex = g.vertices.get(index_last_created_vertex);
        draw(canvas, ctx, g);
        draw_line(vertex, e.pageX, e.pageY, ctx);
        return false;
    }
    else if ( interactor_edge.last_down == DOWN_TYPE.VERTEX_NON_SELECTED ||  interactor_edge.last_down == DOWN_TYPE.VERTEX_SELECTED){
        let vertex = g.vertices.get(interactor_edge.last_down_index);
        draw(canvas, ctx, g);
        draw_line(vertex, e.pageX, e.pageY, ctx);
        return false;
    }
    return false;
})

interactor_edge.mouseup = ((canvas, ctx, g, e) => {
    console.log("mouseup ", interactor_edge.last_down);
    
    if ( interactor_edge.last_down == DOWN_TYPE.VERTEX_NON_SELECTED ||  interactor_edge.last_down == DOWN_TYPE.VERTEX_SELECTED){
        let index = g.get_vertex_index_nearby(e.pageX, e.pageY);
        if (index) {
            if(interactor_edge.last_down_index != index){
                g.add_edge(interactor_edge.last_down_index, index);
            }
        }
    }
})