import { setup_actions_div } from "./actions";
import { draw, resizeCanvas } from "./draw";
import { setup_interactions, select_interactor, setup_interactors_div } from "./interactors/interactor_manager";
import { params_available_turn_off_div, params_available_turn_on_div, update_params_available_div } from "./parametors/div_parametor";
import { setup_parametors_available } from "./parametors/parametor_manager";
import { setup_socket, socket } from "./socket";
import { setup_generators_div } from "./generators/dom";
import { ClientBoard } from "./board/board";
import { setup_modifyers_div } from "./modifyers/dom";
import { SideBar } from "./side_bar/side_bar";
import { ORIENTATION_INFO, ORIENTATION_SIDE_BAR } from "./side_bar/element_side_bar";
import { ItemSideBar } from "./side_bar/item_side_bar";
import { FolderSideBar, FOLDER_EXPAND_DIRECTION } from "./side_bar/folder_side_bar";
import { InteractorV2 } from "./side_bar/interactor_side_bar";
import { SwitchSideBar } from "./side_bar/switch_side_bar";
import { selectionV2 } from "./side_bar/interactors/selection";
import { edge_interactorV2 } from "./side_bar/interactors/edge";
import { detector_interactorV2 } from "./side_bar/interactors/detector";
import { arc_interactorV2 } from "./side_bar/interactors/arc";
import { control_point_interactorV2 } from "./side_bar/interactors/control_points";
import { stroke_interactorV2 } from "./side_bar/interactors/stroke";
import { rectangle_interactorV2 } from "./side_bar/interactors/rectangle";
import { area_interactorV2 } from "./side_bar/interactors/area";
import { eraser_interactorV2 } from "./side_bar/interactors/eraser";
import { text_interactorV2 } from "./side_bar/interactors/text";
import { color_interactorV2 } from "./side_bar/interactors/color";
import ENV from './.env.json';

export const local_board = new ClientBoard();


function setup() {

    const canvas = document.getElementById('main') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    canvas.onmouseleave = ((e) => {
        local_board.view.is_drawing_interactor = false;
        draw(canvas, ctx, local_board.graph);
    });

    canvas.onmouseenter = ((e) => {
        local_board.view.is_drawing_interactor = true;
        draw(canvas, ctx, local_board.graph);
    })

    setup_socket(canvas, ctx, local_board);

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    window.addEventListener('resize', function () { 
        resizeCanvas(canvas, ctx, local_board.graph); 
    }, false);
    document.addEventListener('contextmenu', event => event.preventDefault());
    setup_interactions(canvas, ctx, local_board.graph);
    setup_interactors_div(canvas, ctx, local_board.graph);
    select_interactor(edge_interactorV2, canvas, ctx, local_board.graph, null);

    setup_actions_div(canvas, ctx, local_board.graph);
    setup_generators_div(canvas, local_board);
    setup_modifyers_div(canvas, local_board.view);

    setup_parametors_available();
    update_params_available_div(canvas, ctx, local_board.graph);

    let params_loaded_button = document.getElementById("params_loaded_button");
    params_loaded_button?.addEventListener('click', () => {
        params_available_turn_on_div();
    });

    let params_available_button = document.getElementById("params_available_button");
    params_available_button?.addEventListener('click', () => {
        params_available_turn_off_div();
    });



    // BOTTOM SIDE BAR TEST

    const bottom_side_bar = new SideBar("side_bar_bottom_test", ORIENTATION_SIDE_BAR.HORIZONTAL, true);  

    const switch_button_triangular_grid = new SwitchSideBar("switch_button_triangular_grid", "Switch triangular grid", "", ORIENTATION_INFO.TOP, "img/actions/triangular_grid.svg", "pointer", bottom_side_bar);
    const switch_button_rect_grid = new SwitchSideBar("switch_button_rect_grid", "Switch rectangular grid", "", ORIENTATION_INFO.TOP, "img/actions/grid.svg", "pointer", bottom_side_bar);
    
    switch_button_triangular_grid.trigger = () => { 
        local_board.view.display_triangular_grid = switch_button_triangular_grid.state;
        if (switch_button_triangular_grid.state){
            local_board.view.grid_show = false;
            switch_button_rect_grid.state = false;
            switch_button_rect_grid.unselect();
        }
    };
    
    switch_button_rect_grid.trigger = () => { 
        local_board.view.grid_show = switch_button_rect_grid.state;
        if (switch_button_rect_grid.state){
            local_board.view.display_triangular_grid = false;
            switch_button_triangular_grid.state = false;
            switch_button_triangular_grid.unselect();
        }
    };


    const b2 = new SideBar("b2", ORIENTATION_SIDE_BAR.HORIZONTAL);
    const e3 = new InteractorV2("e3", "Test info", "K", ORIENTATION_INFO.TOP, "img/interactor/arc.svg","pointer", new Set()); 
    const e4 = new InteractorV2("e4", "Test info", "K", ORIENTATION_INFO.TOP, "img/interactor/color.svg","pointer", new Set()); 

    b2.add_elements(e3, e4);
    // b2.dom.style.bottom = "50px";

    
    const f1 = new FolderSideBar("f1", "bla", "",ORIENTATION_INFO.TOP, "img/interactor/detector.svg", "default", b2, FOLDER_EXPAND_DIRECTION.TOP);


    const b3 = new SideBar("b3", ORIENTATION_SIDE_BAR.HORIZONTAL);
    const e7 = new InteractorV2("e7", "Test info", "K",ORIENTATION_INFO.TOP, "img/interactor/color.svg","pointer", new Set()); 
    const e5 = new InteractorV2("e5", "Test info", "K",ORIENTATION_INFO.TOP, "img/interactor/arc.svg","pointer", new Set()); 
    const e6 = new InteractorV2("e6", "Test info", "K",ORIENTATION_INFO.TOP, "img/interactor/color.svg","pointer", new Set()); 

    b3.add_elements(e7, e5, e6);

    
    const f2 = new FolderSideBar("f2", "bla", "",ORIENTATION_INFO.TOP, "img/interactor/detector.svg", "default", b3, FOLDER_EXPAND_DIRECTION.TOP);


    
    const e1 = new InteractorV2("e1", "Test info", "K",ORIENTATION_INFO.TOP, "img/interactor/arc.svg","pointer", new Set()); 
    const e2 = new InteractorV2("e2", "Test info", "K",ORIENTATION_INFO.TOP, "img/interactor/color.svg","pointer" , new Set()); 
    bottom_side_bar.add_elements(e1, e2, f1, f2);

    bottom_side_bar.dom.style.bottom = "0px";

    e1.trigger = () => {
        console.log("e1 triggered");
    }

    const b4 = new SideBar("b4", ORIENTATION_SIDE_BAR.HORIZONTAL);
    const e8 = new InteractorV2("e8", "A",  "Test info",ORIENTATION_INFO.TOP, "img/interactor/color.svg","pointer", new Set()); 
    const f4 = new FolderSideBar("f4", "", "",ORIENTATION_INFO.TOP, "img/interactor/color.svg", "pointer", b4, FOLDER_EXPAND_DIRECTION.TOP);

    b2.add_elements(f4);
    b4.add_elements(e8);

    document.body.appendChild(bottom_side_bar.dom);




    // RIGHT SIDE BAR TEST

    const right_side_bar = new SideBar("right_sidebar_test", ORIENTATION_SIDE_BAR.VERTICAL, true);  

    const edge_side_bar = new SideBar("b5", ORIENTATION_SIDE_BAR.VERTICAL);

    const edge_folder = new FolderSideBar("edge_folder", "Link interactors", "", ORIENTATION_INFO.LEFT, "img/interactors/edition.svg", "default", edge_side_bar, FOLDER_EXPAND_DIRECTION.LEFT);

    edge_side_bar.add_elements(edge_interactorV2, arc_interactorV2, control_point_interactorV2);

    if (ENV.mode == "dev"){
        right_side_bar.add_elements(detector_interactorV2);
    }

    right_side_bar.add_elements(
        selectionV2,
        edge_folder, 
        stroke_interactorV2, 
        color_interactorV2,
        area_interactorV2,
        rectangle_interactorV2,
        text_interactorV2,
        eraser_interactorV2 );



    right_side_bar.dom.style.right = "0px";
    right_side_bar.dom.style.top = "150px";

    document.body.appendChild(right_side_bar.dom);





    draw(canvas, ctx, local_board.graph);
}

setup()


