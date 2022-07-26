import { Interactor, DOWN_TYPE } from './interactor'

// INTERACTOR DETECTOR

export const interactor_detector = new Interactor("detector", "d", "detector.svg", new Set([DOWN_TYPE.VERTEX, DOWN_TYPE.LINK, DOWN_TYPE.STROKE]))


interactor_detector.mousedown = ((canvas, ctx, g, e) => { });

interactor_detector.mousemove = ((canvas, ctx, g, e) => {
    g.clear_all_selections();
    const element = g.get_element_nearby(e, interactor_detector.interactable_element_type);
    switch (element.type) {
        case DOWN_TYPE.VERTEX:
            const vertex = g.vertices.get(element.index);
            vertex.is_selected = true;
            break
        case DOWN_TYPE.STROKE:
            const stroke = g.strokes.get(element.index);
            stroke.is_selected = true;
            break;
        case DOWN_TYPE.LINK:
            const link = g.links.get(element.index);
            link.is_selected = true;
            break;
    }
    return true;
});

interactor_detector.mouseup = ((canvas, ctx, g, e) => { });