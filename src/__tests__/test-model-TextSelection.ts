
"use strict";

import TextSelection from "../model/TextSelection";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const generateDOM = () => {
    const htmlSource = `<html><body>
        <div id="text1" class="text">
            <p id="para1" class="para">first paragraph</p>
            <p class="para">second graph<br/>with a second line</p>
        </div>
        </body></html>`;
    const dom = new JSDOM(htmlSource, { pretendToBeVisual: true });
    let window = dom.window;
    return dom;
}

const getDOMNodes = () => {
    const dom = generateDOM();
    const div = dom.window.document.getElementsByTagName("div")[0];
    const p1 = dom.window.document.getElementsByTagName("p")[0];
    const p2 = dom.window.document.getElementsByTagName("p")[1];
    const br = dom.window.document.getElementsByTagName("br")[0];
    return {dom: dom, div: div, p1: p1, p2: p2, br: br};
}

test("RDFaTextSelection creates base object", () => {
    const domNodes = getDOMNodes();
    const selection = new TextSelection(domNodes.p1, 0, domNodes.p2, 5, domNodes.div, 13, 46);
    expect(selection.endOffset).toBe(5);
});


