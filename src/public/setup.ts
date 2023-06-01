import { draw, resizeCanvas, toggle_dark_mode } from "./draw";
import { setup_interactions, select_interactor, setup_interactors_div } from "./interactors/interactor_manager";
import { params_available_turn_off_div, params_available_turn_on_div, update_params_available_div } from "./parametors/div_parametor";
import { setup_parametors_available } from "./parametors/parametor_manager";
import { setup_socket, socket } from "./socket";
import { setup_generators_div, turn_on_generators_div } from "./generators/dom";
import { ClientBoard, SocketMsgType } from "./board/board";
import { setup_modifyers_div, turn_on_modifyers_div } from "./modifyers/dom";
import { SideBar } from "./side_bar/side_bar";
import { ORIENTATION_INFO, ORIENTATION_SIDE_BAR } from "./side_bar/element_side_bar";
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
import { SideBarLauncher } from "./side_bar/side_bar_launcher";
import BASIC_COLORS from "./basic_colors.json";
import { TikZ_create_file_data } from "./tikz";
import { INDEX_TYPE } from "./board/camera";
import { create_popup } from "./popup";


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

    const show_generators = new SideBarLauncher("show_generators", "Show graph generators", "", ORIENTATION_INFO.BOTTOM, "img/actions/generator.svg", "pointer", turn_on_generators_div, bottom_side_bar);


    const show_modifyers = new SideBarLauncher("show_modifyers", "Show graph modifyers", "",  ORIENTATION_INFO.BOTTOM, "img/actions/modifyer.svg", "pointer", turn_on_modifyers_div, bottom_side_bar);


    const switch_button_triangular_grid = new SwitchSideBar("switch_button_triangular_grid", "Switch triangular grid", "", ORIENTATION_INFO.BOTTOM, "img/actions/triangular_grid.svg", "pointer", bottom_side_bar);
    const switch_button_rect_grid = new SwitchSideBar("switch_button_rect_grid", "Switch rectangular grid", "", ORIENTATION_INFO.BOTTOM, "img/actions/grid.svg", "pointer", bottom_side_bar);
    
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

    const align_action = new SwitchSideBar("align_mode", "Automatic alignement", "", ORIENTATION_INFO.BOTTOM, "img/actions/align.svg", "pointer", bottom_side_bar);
    align_action.trigger = () => {
        local_board.view.is_aligning = align_action.state;

    }


    const dark_mode_launcher = new SideBarLauncher("dark_mode", "Toggle dark mode", "", ORIENTATION_INFO.BOTTOM, "img/actions/dark_mode.svg", "pointer", 
    () => {
        if(local_board.view.dark_mode){
            toggle_dark_mode(false);
            local_board.view.dark_mode = false;
            for( const name in BASIC_COLORS){
                document.getElementById("color_choice_" + name).style.backgroundColor = BASIC_COLORS[name].light;
            } 
        }
        else{
            toggle_dark_mode(true);
            local_board.view.dark_mode = true;
            for( const name in BASIC_COLORS){
                document.getElementById("color_choice_" + name).style.backgroundColor = BASIC_COLORS[name].dark;
            } 
        }

    }
    ,bottom_side_bar);


    const export_dir = new SideBar("export_dir", ORIENTATION_SIDE_BAR.HORIZONTAL);
    const export_dir2 = new FolderSideBar("export_dir", "Export graph", "", ORIENTATION_INFO.BOTTOM, "img/actions/export.svg", "default", export_dir, FOLDER_EXPAND_DIRECTION.BOTTOM);

    const export_tikz = new SideBarLauncher("export_tikz", "Export to .tex (tikz)", "", ORIENTATION_INFO.BOTTOM, "img/actions/export_tex.svg", "pointer", 
    () => {
        const tikz_data = TikZ_create_file_data(local_board.graph);
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(new Blob([tikz_data], { type: "text/plain" }));
        a.download = "file.tex";
        a.click();
    }
    ,export_dir);

    const export_gco = new SideBarLauncher("export_gco", "Export to .gco (our special format)", "", ORIENTATION_INFO.BOTTOM, "img/actions/export_gco.svg", "pointer", 
    () => {
        socket.emit(SocketMsgType.GET_JSON, (response: string) => {
            const a = document.createElement("a");
            a.href = window.URL.createObjectURL(new Blob([response], { type: "text/plain" }));
            a.download = "file.gco";
            a.click();
        })
    }
    ,export_dir);

    bottom_side_bar.add_elements( export_dir2);
    

    // ------------ 
    // share link

    function shareLink(){
        socket.emit("get_room_id", (room_id: string) => {
            navigator.clipboard.writeText(location.origin + "/?room_id=" + room_id);
                /*
                .then(() => {
                    const subactions_div = document.getElementById(load_file_action.name + "_subactions");
                    subactions_div.classList.add("subaction_info");
                    subactions_div.innerHTML = "Copied!</br>" + location.origin + "/?room_id=" + room_id;
                    subactions_div.style.display = "block"
                });
                */
        });
    }

    new SideBarLauncher("shareAction", "Share URL", "", ORIENTATION_INFO.BOTTOM, "img/actions/share.svg", "pointer", shareLink, bottom_side_bar);


    // --------------
    // Load file

    function loadFile() {
        const popUpDiv = create_popup("loadFilePopUp", "Load file");
        popUpDiv.style.display = "block";

        const fileInput: HTMLInputElement = document.createElement("input");
        fileInput.type = "file";
        fileInput.style.display = "none";
        fileInput.onchange = function () {
            let input = fileInput.files[0];
            popUpDiv.style.display = "none";
            let reader = new FileReader();
            reader.readAsText(input);
            reader.onload = function () {
                socket.emit(SocketMsgType.LOAD_JSON, reader.result);
            };
        }
        popUpDiv.appendChild(fileInput);
        fileInput.style.display = "inline-block";
    }


    new SideBarLauncher("loadFile", "Load File", "", ORIENTATION_INFO.BOTTOM, "img/actions/import.svg", "pointer", loadFile, bottom_side_bar);


    // ---------------------
    // Automatic indexes

    const autom_indices_bar = new SideBar("autom_indices_dir_bar", ORIENTATION_SIDE_BAR.HORIZONTAL);
    const autom_indices_dir = new FolderSideBar("autom_indices_dir", "Automatic indices", "", ORIENTATION_INFO.BOTTOM, "img/actions/index.svg", "default", autom_indices_bar, FOLDER_EXPAND_DIRECTION.BOTTOM);

    const change_to_none_index = new SideBarLauncher("index_type_none", "Remove all labels", "", ORIENTATION_INFO.BOTTOM, "img/actions/index_none.svg", "pointer", 
    () => {
        local_board.view.index_type = INDEX_TYPE.NONE;
        local_board.graph.compute_vertices_index_string(local_board.view);
    }
    ,autom_indices_bar);

    const change_to_number_stable_index = new SideBarLauncher("index_type_number_stable", "[Stable numerical] Set automatically labels to numeric and maintain labels after vertices deletions.", "", ORIENTATION_INFO.BOTTOM, "img/actions/index_number_stable.svg", "pointer", 
    () => {
        local_board.view.index_type = INDEX_TYPE.NUMBER_STABLE;
        local_board.graph.compute_vertices_index_string(local_board.view);
    }
    ,autom_indices_bar);

    const change_to_number_unstable_index = new SideBarLauncher("index_type_number_unstable", "[Unstable numerical] Set automatically labels to numeric. Labels will be recomputed after vertices deletions so that there are between 0 and n-1.", "", ORIENTATION_INFO.BOTTOM, "img/actions/index_number_unstable.svg", "pointer", 
    () => {
        local_board.view.index_type = INDEX_TYPE.NUMBER_UNSTABLE;
        local_board.graph.compute_vertices_index_string(local_board.view);
    }
    ,autom_indices_bar);

    const change_to_alpha_stable_index = new SideBarLauncher("index_type_alpha_stable", "[Stable alphabetical] Set automatically labels to alphabetic and maintain labels after vertices deletions.", "", ORIENTATION_INFO.BOTTOM, "img/actions/index_alpha_stable.svg", "pointer", 
    () => {
        local_board.view.index_type = INDEX_TYPE.ALPHA_STABLE;
        local_board.graph.compute_vertices_index_string(local_board.view);
    }
    ,autom_indices_bar);


    const change_to_alpha_unstable_index = new SideBarLauncher("index_type_number_stable", "[Unstable alphabetic] Set automatically labels to alphabetic. Labels will be recomputed after vertices deletions so that there are between a and z.", "", ORIENTATION_INFO.BOTTOM, "img/actions/index_alpha_unstable.svg", "pointer", 
    () => {
        local_board.view.index_type = INDEX_TYPE.ALPHA_UNSTABLE;
        local_board.graph.compute_vertices_index_string(local_board.view);
    }
    ,autom_indices_bar);

    bottom_side_bar.add_elements( autom_indices_dir);


    // -------

    const b3 = new SideBar("b3", ORIENTATION_SIDE_BAR.HORIZONTAL);
    const e7 = new InteractorV2("e7", "Test info", "K",ORIENTATION_INFO.TOP, "img/interactor/color.svg","pointer", new Set()); 
    const e5 = new InteractorV2("e5", "Test info", "K",ORIENTATION_INFO.TOP, "img/interactor/arc.svg","pointer", new Set()); 
    const e6 = new InteractorV2("e6", "Test info", "K",ORIENTATION_INFO.TOP, "img/interactor/color.svg","pointer", new Set()); 

    b3.add_elements(e7, e5, e6);

    



    bottom_side_bar.dom.style.top = "10px";
    bottom_side_bar.dom.style.left = "200px";


    const b4 = new SideBar("b4", ORIENTATION_SIDE_BAR.HORIZONTAL);
    const e8 = new InteractorV2("e8", "A",  "Test info",ORIENTATION_INFO.TOP, "img/interactor/color.svg","pointer", new Set()); 

    b4.add_elements(e8);

    document.body.appendChild(bottom_side_bar.dom);




    // LEFT SIDE BAR TEST

    const left_side_bar = new SideBar("left_sidebar_test", ORIENTATION_SIDE_BAR.VERTICAL, true);  

    const edge_side_bar = new SideBar("b5", ORIENTATION_SIDE_BAR.VERTICAL);

    const edge_folder = new FolderSideBar("edge_folder", "Link interactors", "", ORIENTATION_INFO.RIGHT, "img/interactors/edition.svg", "default", edge_side_bar, FOLDER_EXPAND_DIRECTION.RIGHT);

    edge_side_bar.add_elements(edge_interactorV2, arc_interactorV2, control_point_interactorV2);

    if (ENV.mode == "dev"){
        left_side_bar.add_elements(detector_interactorV2);
    }

    left_side_bar.add_elements(
        selectionV2,
        edge_folder, 
        stroke_interactorV2, 
        color_interactorV2,
        area_interactorV2,
        rectangle_interactorV2,
        text_interactorV2,
        eraser_interactorV2 );



    left_side_bar.dom.style.left = "0px";
    left_side_bar.dom.style.top = "150px";

    document.body.appendChild(left_side_bar.dom);





    draw(canvas, ctx, local_board.graph);
}

setup()


