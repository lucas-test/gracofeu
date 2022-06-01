// INTERACTOR EDGE

var index_last_created_vertex = null; // est ce qu'on peut pas intégrer ça dans interactor_edge directement ?


var interactor_edge = new Interactor("edge", "e", "edition.svg");

interactor_edge.mousedown = ((d, k, canvas, ctx, g, e) => {

    if (d == DOWN_TYPE.EMPTY) {
        let index = g.add_vertex(e.pageX, e.pageY);
        index_last_created_vertex = index;
    }
    if (d === DOWN_TYPE.VERTEX_NON_SELECTED || d === DOWN_TYPE.VERTEX_SELECTED) {
        index_last_created_vertex = k;
        console.log(k);
    }


})

interactor_edge.mousemove = ((canvas, ctx, g, e) => {
    console.log("mousemove");
    if (interactor_edge.last_down == DOWN_TYPE.EMPTY || index_last_created_vertex != null) {
        let vertex = g.vertices.get(index_last_created_vertex);
        draw(canvas, ctx, g);
        draw_line(vertex, e.pageX, e.pageY, ctx);
        return false;
    }
    return false;
})

interactor_edge.mouseup = ((canvas, ctx, g, e) => {
    console.log("mouseup", interactor_edge.has_moved);
    let index = g.get_vertex_index_nearby(e.pageX, e.pageY);

    if (index) {
        if(index_last_created_vertex !== null){
            g.add_edge(index_last_created_vertex, index);
        }
    }
    index_last_created_vertex = null;
})