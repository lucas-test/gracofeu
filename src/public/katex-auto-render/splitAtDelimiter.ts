
export class Delimiter {
    left: string;
    right: string;
    display: boolean;

    constructor(left: string, right: string, display: boolean){
        this.left = left;
        this.right = right;
        this.display = display;
    }
}

export class SplitElement{
    type: string;
    data: string;
    rawData: string;
    display: boolean;

    constructor(type: string, data: string, rawData: string, display: boolean){
        this.type = type;
        this.data = data;
        this.rawData = rawData;
        this.display = display;
    }
}



const findEndOfMath = function(delimiter: string, text: string, startIndex: number) {
    // Adapted from
    // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
    let index = startIndex;
    let braceLevel = 0;

    const delimLength = delimiter.length;

    while (index < text.length) {
        const character = text[index];

        if (braceLevel <= 0 &&
            text.slice(index, index + delimLength) === delimiter) {
            return index;
        } else if (character === "\\") {
            index++;
        } else if (character === "{") {
            braceLevel++;
        } else if (character === "}") {
            braceLevel--;
        }

        index++;
    }

    return -1;
};

const escapeRegex = function(string: string) {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};

const amsRegex = /^\\begin{/;

const splitAtDelimiters = function(text: string, delimiters: Array<Delimiter>): Array<SplitElement> {
    let index;
    const data = Array<SplitElement>();

    const regexLeft = new RegExp(
        "(" + delimiters.map((x) => escapeRegex(x.left)).join("|") + ")"
    );

    while (true) {
        index = text.search(regexLeft);
        if (index === -1) {
            break;
        }
        if (index > 0) {
            data.push(new SplitElement( "text", text.slice(0, index), "", true));
            text = text.slice(index); // now text starts with delimiter
        }
        // ... so this always succeeds:
        const i = delimiters.findIndex((delim) => text.startsWith(delim.left));
        index = findEndOfMath(delimiters[i].right, text, delimiters[i].left.length);
        if (index === -1) {
            break;
        }
        const rawData = text.slice(0, index + delimiters[i].right.length);
        const math = amsRegex.test(rawData)
            ? rawData
            : text.slice(delimiters[i].left.length, index);
        data.push(new SplitElement("math", math, rawData, delimiters[i].display ));
        text = text.slice(index + delimiters[i].right.length);
    }

    if (text !== "") {
        data.push(new SplitElement("text", text, "", false));
    }

    return data;
};

export default splitAtDelimiters;