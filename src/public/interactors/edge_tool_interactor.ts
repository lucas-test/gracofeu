import { Interactor } from "./interactor";
import { interactor_arc } from "./arc_interactor";
import { interactor_edge } from "./edge_interactor";
import { interactor_control_point } from "./implementations/control_point";

export const interactor_tool_edge = new Interactor("edge", "e", "edition.svg", new Set(), 'default');


interactor_tool_edge.subinteractors.push(interactor_edge, interactor_arc, interactor_control_point);