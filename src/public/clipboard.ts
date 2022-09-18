import { CanvasCoord } from "./board/coord";
import { Graph } from "./board/graph";
import { socket } from "./socket";

export let graph_clipboard: Graph = null;
export let mouse_position_at_generation: CanvasCoord = null;
export let clipboard_comes_from_generator = false;


export function set_clipboard(graph: Graph, pos_at_click: CanvasCoord, is_coming_from_clipboard: boolean, canvas: HTMLCanvasElement){
    graph_clipboard = graph;
    mouse_position_at_generation = pos_at_click;
    clipboard_comes_from_generator = is_coming_from_clipboard;
    canvas.style.cursor = "grab";
}

export function paste_generated_graph() {
    socket.emit("paste_graph", [...graph_clipboard.vertices.entries()], [...graph_clipboard.links.entries()]);
}

export function clear_clipboard(canvas: HTMLCanvasElement){
    graph_clipboard = null;
    canvas.style.cursor = "auto";
    clipboard_comes_from_generator = false;
}

