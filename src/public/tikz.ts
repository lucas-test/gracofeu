import {
    Graph
} from "./board/graph";

function TikZ_header() {
    return "\\documentclass[border=1mm, tikz,dvipsnames]{standalone} \n\\usepackage{tikz} \n\\usetikzlibrary{decorations.pathreplacing, decorations.markings} \n\\usetikzlibrary{calc} \n\\usepackage{xcolor}\n\n\\def\\empty{} \n\\pgfkeys{utils/.cd,\n	set if not empty/.code n args={3}{%\n		\\def\\arg{#2}%\n		\\ifx\\arg\\empty%\n		\\pgfkeys{#1={#3}}%\n		\\else%\n		\\pgfkeys{#1={#2}}%\n		\\fi%\n	},\n	set if labelpos not empty/.code n args={2}{%\n		\\def\\arg{#1}%\n		\\ifx\\arg\\empty%\n	\\else%\n		\\def\\argo{#2}%\n		\\ifx\\argo\\empty%\n		\\pgfkeys{/tikz/label={#1}}%\n		\\else%\n		\\pgfkeys{/tikz/label={#2}:{#1}}%\n		\\fi%\n		\\fi%\n	},\n	set if arrowpos not empty/.code n args={3}{%\n		\\def\\arg{#1}%\n		\\def\\arstyle{#3}%\n		\\ifx\\arstyle\\empty%\n		\\def\\arr{\\arrow[>=stealth]{>}}\n		\\else%\n		\\def\\arr{#3}\n		\\fi%\n		\\ifx\\arg\\empty%\n		\\pgfkeys{/pgf/decoration/mark={at position #2 with {\\arr}}}%\n		\\else%\n		\\pgfkeys{/pgf/decoration/mark={at position #1 with {\\arr}}}%\n		\\fi%\n	},\n}\n\\tikzset{\n	nodes/.style n args={4}{\n		draw ,circle,outer sep=0.7mm,\n		/utils/set if not empty={/tikz/fill}{#1}{black},\n		/utils/set if not empty={/tikz/minimum size}{#4}{5},\n		/utils/set if labelpos not empty={#2}{#3},\n		line width = 0.7pt\n},\n	arc/.style n args={3}{\n		postaction={\n			decorate,\n			decoration={markings,\n				/utils/set if arrowpos not empty={#1}{1}{}%\n			}\n		},\n		/utils/set if not empty={/tikz/line width}{#2}{0.7pt},\n		{#3}\n	}\n}\n\n";
}

function Tikz_create_defines() {
    return "\t\t%Defining some constants\n\t\t\\def\\scaleL{0.95}; %Scale of the labels of vertices\n\t\t\\def\\scaleE{0.8}; %Scale of the edges\n\t\t\\def\\scaleV{0.45}; %Scale of the vertices\n";
}


function TikZ_credits() {
    return " %LaTeX code generated using https://graccoon.herokuapp.com/ \n";
}

function TikZ_create_coordinates(g: Graph) {
    let coordinates = "\t\t%Defining the coordinates for the vertices\n";
    for (const index of g.vertices.keys()) {
        const v = g.vertices.get(index);
        coordinates += ("\t\t" + v.tikzify_coordinate(index) + "\n");
    }
    return coordinates;
}

function TikZ_create_nodes(g: Graph) {
    let coordinates = `\t\t%Drawing the vertices\n\t\t % HOW TO USE IT: \\node[scale = SCALE_VALUE, nodes={COLOR_OF_THE_NODE}{TEXT_LABEL}{POSITION_LABEL}{SIZE_NODE}] at  (COORDINATE)  {};\n\t\t%e.g. : \\node[scale = 0.5, nodes={red}{$v$}{above left}{}] at  (0,0)  {};\n`;
    for (let index of g.vertices.keys()) {
        let v = g.vertices.get(index);
        coordinates += ("\t\t" + v.tikzify_node(index) + "\n");
        // coordinates += ("\t\t" + v.tikzify_label() + "\n");
    }
    return coordinates;
}

function TikZ_create_links(g: Graph) {
    let edgesString = "\t\t%Drawing the edges/arcs\n";
    for (let e of g.links.values()) {
        const start = g.vertices.get(e.start_vertex);
        const end = g.vertices.get(e.end_vertex);
        edgesString += ("\t\t" + e.tikzify_link(start, e.start_vertex, end, e.end_vertex) + "\n");
    }
    return edgesString;
}


export function TikZ_create_file_data(g: Graph) {
    let latex = TikZ_credits() + "\n\n";
    latex += TikZ_header();
    // latex += defineColors();
    latex += "\\begin{document}\n	\\begin{tikzpicture}[yscale=-1]\n";
    latex += Tikz_create_defines() + "\n";
    latex += TikZ_create_coordinates(g) + "\n";
    latex += TikZ_create_links(g) + "\n";
    latex += TikZ_create_nodes(g) + "\n";
    latex += "\n\t\\end{tikzpicture}\n\\end{document}\n";
    return latex;
}