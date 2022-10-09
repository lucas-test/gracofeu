import BASIC_COLORS from "./basic_colors.json";

export type BasicColorName = string;

// return a Hex Color String
export function real_color2(color_name: BasicColorName, dark_mode: boolean) : string{
    if(dark_mode){
        return BASIC_COLORS[color_name].dark;
    }
    else {
        return BASIC_COLORS[color_name].light
    }
}
