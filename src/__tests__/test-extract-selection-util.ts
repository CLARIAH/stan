import SelectionUtil from "../util/extract-selection-util";
import MouseSelection from "../model/MouseSelection";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const generateDOM = () => {
    const htmlSource = `<html><body>
        <div id="text1" class="text">
            <p id="para1" class="para">first paragraph</p>
            <p class="para">second graph<br/>with a second line</p>
            and some extra text
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

const selectionUtil = new SelectionUtil();

test("preceeds return true when node1 contains node2", () => {
    const dom = generateDOM();
    const node1 = dom.window.document.getElementsByTagName("div")[0];
    const node2 = dom.window.document.getElementsByTagName("p")[0];
    expect(selectionUtil.preceeds(node1, node2)).toBe(true);
});

test("preceeds return false when node1 is contained by node2", () => {
    const dom = generateDOM();
    const node1 = dom.window.document.getElementsByTagName("p")[0];
    const node2 = dom.window.document.getElementsByTagName("div")[0];
    expect(selectionUtil.preceeds(node1, node2)).toBe(false);
});

test("preceeds return true when node1 preceeds node2", () => {
    const dom = generateDOM();
    const node1 = dom.window.document.getElementsByTagName("p")[0];
    const node2 = dom.window.document.getElementsByTagName("p")[1];
    expect(selectionUtil.preceeds(node1, node2)).toBe(true);
});

test("preceeds return false when node1 follows node2", () => {
    const dom = generateDOM();
    const node1 = dom.window.document.getElementsByTagName("p")[1];
    const node2 = dom.window.document.getElementsByTagName("p")[0];
    expect(selectionUtil.preceeds(node1, node2)).toBe(false);
});

test("preceeds return false when node1 is node2", () => {
    const dom = generateDOM();
    const node1 = dom.window.document.getElementsByTagName("p")[0];
    const node2 = dom.window.document.getElementsByTagName("p")[0];
    expect(selectionUtil.preceeds(node1, node2)).toBe(false);
});

test("findNodeOffsetInContainer of p2 in p1 throws an error", () => {
    const dom = generateDOM();
    const containerNode = dom.window.document.getElementsByTagName("p")[0];
    const containedNode = dom.window.document.getElementsByTagName("p")[1];
    let error = null;
    try {
        const offset = selectionUtil.findNodeOffsetInContainer(containedNode, containerNode);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
});

test("findNodeOffsetInContainer of br in p2 returns correct offset", () => {
    const dom = generateDOM();
    const containerNode = dom.window.document.getElementsByTagName("p")[1];
    const containedNode = dom.window.document.getElementsByTagName("br")[0];
    let error = null;
    const offset = selectionUtil.findNodeOffsetInContainer(containedNode, containerNode);
    expect(offset).toBe(12);
});

test("findNodeOffsetInContainer of last text node in div returns correct offset", () => {
    const dom = generateDOM();
    const containerNode = dom.window.document.getElementsByTagName("div")[0];
    const node = dom.window.document.getElementsByTagName("p")[1];
    const containedNode = node.lastChild;
    if (containedNode) {
        const offset = selectionUtil.findNodeOffsetInContainer(containedNode, containerNode);
        expect(offset).toBe(53);
    } else {
        expect(containedNode).not.toBe(null);
    }
});

test("makeTextSelection throws an error if start and end nodes don't share a container node", () => {
    const domNodes = getDOMNodes();
    const mouseSelection = new MouseSelection(domNodes.dom.window.document, 0, domNodes.p1, 0);
    let error = null;
    try {
        selectionUtil.makeTextSelection(mouseSelection);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
});

test("makeTextSelection returns TextSelection if mouse selection has a valid containerNode", () => {
    const domNodes = getDOMNodes();
    const mouseSelection = new MouseSelection(domNodes.p1, 0, domNodes.p1, 10);
    const textSelection = selectionUtil.makeTextSelection(mouseSelection);
    expect(textSelection.containerNode).not.toBe(null);
});
