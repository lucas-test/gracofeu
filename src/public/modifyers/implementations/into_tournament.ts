import { Coord, ORIENTATION } from "gramoloss";
import { ClientLink } from "../../board/link";
import { Integer } from "../../generators/attribute";
import { local_board } from "../../setup";
import { GraphModifyer } from "../modifyer";

export const modifyer_into_tournament = new GraphModifyer("into_tournament", [])
modifyer_into_tournament.modify = (index: string | number) => {
    if (typeof index == "string"){
        local_board.graph.complete_into_tournament((x,y) => { return new ClientLink(x,y, "", ORIENTATION.DIRECTED,"black", "", local_board.view)})
    }else {

    }
}