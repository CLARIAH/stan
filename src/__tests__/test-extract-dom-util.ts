import DOMUtil from "../util/extract-dom-util";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const fn = () => 'foo';

test('fn() returns foo', () => {
    expect(fn()).toBe("foo");
});

const getBaseDOM = () => {
    const htmlSource = "<html><body><div>hoi</div><br/></body><html>";
    const dom = new JSDOM(htmlSource, { pretendToBeVisual: true });
    let window = dom.window;
    return dom;
}

const getComplexDOM = () => {
    const htmlSource = "<html><body><div>first paragraph</div><div>second graph<br/>with a second line</div></body><html>";
    const dom = new JSDOM(htmlSource, { pretendToBeVisual: true });
    let window = dom.window;
    return dom;
}

test("getTextNodes returns single div", () => {
    let dom = getBaseDOM();
    let textNodes = DOMUtil.getTextNodes(dom.window.document.body);
    expect(textNodes.length).toBe(1);
    expect(textNodes[0].nodeType).toBe(dom.window.Node.TEXT_NODE);
});

test("filterTextNodes returns single text node", () => {
    let dom = getBaseDOM();
    let div = dom.window.document.getElementsByTagName("div")[0];
    let textNode = div.childNodes[0];
    let nodes : Array<Node> = [div, textNode]
    expect(DOMUtil.filterTextNodes(nodes)[0]).toBe(textNode);
})

test("filterTextNodes returns empty list", () => {
    let dom = getBaseDOM();
    let div = dom.window.document.getElementsByTagName("br")[0];
    let textNode = div.childNodes[0];
    let nodes : Array<Node> = [div]
    expect(DOMUtil.filterTextNodes(nodes).length).toBe(0);
})

test("getElementXpath returns div xpath", () => {
    let dom = getBaseDOM();
    let ele = dom.window.document.getElementsByTagName("div")[0];
    expect(DOMUtil.getElementXpath(ele)).toBe("/html[1]/body[1]/div[1]");
});

test("getXpathElement returns div xpath", () => {
    let dom = getBaseDOM();
    let ele = dom.window.document.getElementsByTagName("div")[0];
    expect(DOMUtil.getXpathElement("/html[1]/body[1]/div[1]", dom.window.document)).toBe(ele);
});

test("getDescentdants on body returns #text, div and br", () => {
    let dom = getBaseDOM();
    expect(DOMUtil.getDescendants(dom.window.document.body).length).toBe(3);
});

test("getDescentdants on br returns empty list", () => {
    let dom = getBaseDOM();
    let br = dom.window.document.getElementsByTagName("br")[0];
    expect(DOMUtil.getDescendants(br).length).toBe(0);
});

test("getCommonAncestor of div 1 and div 2 returns body:", () => {
    let dom = getComplexDOM();
    let div1 = dom.window.document.getElementsByTagName("div")[0];
    let div2 = dom.window.document.getElementsByTagName("div")[1];
    let ancestor = DOMUtil.getCommonAncestor(div1, div2);
    expect(ancestor).toBe(dom.window.document.body);
});

test("getCommonAncestor of div 2 and br returns div 2:", () => {
    let dom = getComplexDOM();
    let br = dom.window.document.getElementsByTagName("br")[0];
    let div2 = dom.window.document.getElementsByTagName("div")[1];
    let ancestor = DOMUtil.getCommonAncestor(br, div2);
    expect(ancestor).toBe(div2);
});

test("getCommonAncestor of div 1 and br returns body:", () => {
    let dom = getComplexDOM();
    let br = dom.window.document.getElementsByTagName("br")[0];
    let div1 = dom.window.document.getElementsByTagName("div")[0];
    let ancestor = DOMUtil.getCommonAncestor(br, div1);
    expect(ancestor).toBe(dom.window.document.body);
});

test("getCommonAncestor of div 1 and div 1 returns div 1:", () => {
    let dom = getComplexDOM();
    let div1 = dom.window.document.getElementsByTagName("div")[0];
    let ancestor = DOMUtil.getCommonAncestor(div1, div1);
    expect(ancestor).toBe(div1);
});



