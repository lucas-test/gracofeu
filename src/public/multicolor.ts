export class Multicolor{
    color : string; // main color
    contrast : string; // text color on main color background
    darken : string;
    lighten : string; 


    // color must be Hex
    constructor(color:string){
        this.color = color;
        this.contrast = invertColor(color);
        this.darken = shadeColor(color, -60);
        this.lighten = shadeColor(color, 120);
    }

    update(){
        this.contrast = invertColor(this.color);
        this.darken = shadeColor(this.color, -60);
        this.lighten = shadeColor(this.color, 120);
    }

    set_color(main_color:string){
        this.color = main_color;
        this.update();
    }
}



// Credits: https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
function invertColor(hex: string) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    // console.log(hex);
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);

    return (r * 0.299 + g * 0.587 + b * 0.114) > 186
        ? '#000000'
        : '#FFFFFF';
}

function shadeColor(color: string, percent: number) {
    var R = parseInt(color.substring(1, 3), 16);
    var G = parseInt(color.substring(3, 5), 16);
    var B = parseInt(color.substring(5, 7), 16);

    R = parseInt((R * (100 + percent) / 100).toString());
    G = parseInt((G * (100 + percent) / 100).toString());
    B = parseInt((B * (100 + percent) / 100).toString());

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}