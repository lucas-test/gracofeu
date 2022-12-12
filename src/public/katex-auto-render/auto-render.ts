import katex, { KatexOptions, ParseError } from "katex";
import splitAtDelimiters, { Delimiter } from "./splitAtDelimiter";

export class RenderOptions implements KatexOptions {
    delimiters: Array<Delimiter>;
    ignoredTags: Array<string>;
    displayMode: boolean | undefined;
}


/* Note: optionsCopy is mutated by this method. If it is ever exposed in the
 * API, we should copy it before mutating.
 */
const renderMathInText = function(text: string, optionsCopy: RenderOptions) {
    const data = splitAtDelimiters(text, optionsCopy.delimiters);
    if (data.length === 1 && data[0].type === 'text') {
        // There is no formula in the text.
        // Let's return null which means there is no need to replace
        // the current text node with a new one.
        return null;
    }

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < data.length; i++) {
        if (data[i].type === "text") {
            fragment.appendChild(document.createTextNode(data[i].data));
        } else {
            const span = document.createElement("span");
            let math = data[i].data;
            // Override any display mode defined in the settings with that
            // defined by the text itself
            optionsCopy.displayMode = data[i].display;
            try {
                katex.render(math, span, optionsCopy);
            } catch (e) {
                if (!(e instanceof ParseError)) {
                    throw e;
                }
                console.error(
                    "KaTeX auto-render: Failed to parse `" + data[i].data +
                        "` with ",
                    e
                );
                fragment.appendChild(document.createTextNode(data[i].rawData));
                continue;
            }
            fragment.appendChild(span);
        }
    }

    return fragment;
};




const renderElem = function(elem: ChildNode, optionsCopy: RenderOptions) {
    for (let i = 0; i < elem.childNodes.length; i++) {
        const childNode = elem.childNodes[i];
        if (childNode.nodeType === 3) {
            // Text node
            // Concatenate all sibling text nodes.
            // Webkit browsers split very large text nodes into smaller ones,
            // so the delimiters may be split across different nodes.
            let textContentConcat = childNode.textContent;
            let sibling = childNode.nextSibling;
            let nSiblings = 0;
            while (sibling && (sibling.nodeType === Node.TEXT_NODE)) {
                textContentConcat += sibling.textContent;
                sibling = sibling.nextSibling;
                nSiblings++;
            }
            const frag = renderMathInText(textContentConcat, optionsCopy);
            if (frag) {
                // Remove extra text nodes
                for (let j = 0; j < nSiblings; j++) {
                    childNode.nextSibling.remove();
                }
                i += frag.childNodes.length - 1;
                elem.replaceChild(frag, childNode);
            } else {
                // If the concatenated text does not contain math
                // the siblings will not either
                i += nSiblings;
            }
        } else if (childNode.nodeType === 1) {
            // Element node
            renderElem(childNode, optionsCopy);
        }
        // Otherwise, it's something else, and ignore it.
    }
};

const renderMathInElement = function(elem: HTMLElement) {
    if (!elem) {
        throw new Error("No element provided to render");
    }

    const optionsCopy = new RenderOptions();

    // default options
    optionsCopy.delimiters = Array(new Delimiter("$", "$", false));
    optionsCopy.ignoredTags = optionsCopy.ignoredTags || [
        "script", "noscript", "style", "textarea", "pre", "code", "option",
    ];
    // NOTIMPLEMENTED optionsCopy.ignoredClasses = optionsCopy.ignoredClasses || [];
    // NOTIMPLEMENTED optionsCopy.errorCallback = optionsCopy.errorCallback || console.error;

    // Enable sharing of global macros defined via `\gdef` between different
    // math elements within a single call to `renderMathInElement`.
    // NOTIMPLEMENTED optionsCopy.macros = optionsCopy.macros || {};

    renderElem(elem, optionsCopy);
};

export default renderMathInElement;