import { Coord, ORIENTATION } from "gramoloss";
import { ClientLink } from "../../board/link";
import { AreaIndex, Integer } from "../../generators/attribute";
import { local_board } from "../../setup";
import { GraphModifyer } from "../modifyer";

export const modifyer_into_tournament = new GraphModifyer("into_tournament", [new AreaIndex("area")])
modifyer_into_tournament.modify = () => {
    const area_index = modifyer_into_tournament.attributes[0].value;
    if (typeof area_index == "string"){
        const all_vertices_indices = new Array();
        for (const index of local_board.graph.vertices.keys()){
            all_vertices_indices.push(index);
        }
        local_board.graph.complete_subgraph_into_tournament(all_vertices_indices, (x,y) => { return new ClientLink(x,y, "", ORIENTATION.DIRECTED,"black", "", local_board.view)} )
    }else {
        const area = local_board.graph.areas.get(area_index);
        const vertices_indices = local_board.graph.vertices_contained_by_area(area);
        local_board.graph.complete_subgraph_into_tournament(vertices_indices, (x,y) => { return new ClientLink(x,y, "", ORIENTATION.DIRECTED,"black", "", local_board.view)});
    }
}