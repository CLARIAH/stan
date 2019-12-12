import DOMUtil from "../util/extract-dom-util";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const generateBaseDOM = () => {
    const htmlSource = "<html><body><div>hoi</div><br/></body></html>";
    const dom = new JSDOM(htmlSource, { pretendToBeVisual: true });
    let window = dom.window;
    return dom;
}

const generateDisplayOffsetDOM = () => {
    const htmlSource = `<html><body>\n  <p>some text <i>with italics</i> and some <i> variation </i> in use of <i>whitespace </i>. </p>  \n</body></html>`;
    const dom = new JSDOM(htmlSource, { pretendToBeVisual: true });
    Object.defineProperty(dom.window.Element.prototype, 'innerText', {
        get() {
          return this.textContent; // make sure innerText is implemented;
          // modified from https://github.com/jsdom/jsdom/issues/1245
        },
        configurable: true, // make it so that it doesn't blow chunks on re-running tests with things like --watch
      });
    return dom;
}

const generateComplexDOM = () => {
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

const domUtil = new DOMUtil();

test("getTextNodes returns single text node for body", () => {
    let dom = generateBaseDOM();
    let textNodes = domUtil.getTextNodes(dom.window.document.body);
    expect(textNodes.length).toBe(1);
    expect(textNodes[0].nodeType).toBe(dom.window.Node.TEXT_NODE);
});

test("getTextNodes returns single text node for text node", () => {
    let dom = generateBaseDOM();
    let div = dom.window.document.getElementsByTagName("div")[0];
    let textNode = div.childNodes[0];
    let textNodes = domUtil.getTextNodes(textNode);
    expect(textNodes.length).toBe(1);
    expect(textNodes[0].nodeType).toBe(dom.window.Node.TEXT_NODE);
});

test("getTextNodes returns empty list for br", () => {
    let dom = generateBaseDOM();
    let br = dom.window.document.getElementsByTagName("br")[0];
    let textNodes = domUtil.getTextNodes(br);
    expect(textNodes.length).toBe(0);
});

test("getTextNodeDisplayOffset returns 0 for first text node", () => {
    const dom = generateDisplayOffsetDOM();
    const body = dom.window.document.body;
    const bodyText1 = body.childNodes[0];
    const offset = domUtil.getTextNodeDisplayOffset(bodyText1, body);
    expect(offset).toBe(0);
});

test("getTextNodeDisplayOffset returns 64 for last text node", () => {
    const dom = generateDisplayOffsetDOM();
    const body = dom.window.document.body;
    const bodyText2 = body.childNodes[2];
    const offset = domUtil.getTextNodeDisplayOffset(bodyText2, body);
    expect(offset).toBe(69);
});

/*
test("getTextNodeDisplayOffset", () => {
    const info = generateDisplayNodesInfo();
    const offset = domUtil.getTextNodeDisplayOffset(info.nodes.divText2, info.divTextNodesDisplayInfo);
    expect(offset).toBe(64);
});

test("getTextNodeDisplayOffset", () => {
    const info = generateDisplayNodesInfo();
    const offset = domUtil.getTextNodeDisplayOffset(info.nodes.pText1, info.divTextNodesDisplayInfo);
    expect(offset).toBe(0);
});

test("getTextNodeDisplayOffset", () => {
    const info = generateDisplayNodesInfo();
    const offset = domUtil.getTextNodeDisplayOffset(info.nodes.pText2, info.divTextNodesDisplayInfo);
    expect(offset).toBe(22);
});

test("getTextNodeDisplayOffset", () => {
    const info = generateDisplayNodesInfo();
    const offset = domUtil.getTextNodeDisplayOffset(info.nodes.pText3, info.divTextNodesDisplayInfo);
    expect(offset).toBe(42);
});

test("getTextNodeDisplayOffset", () => {
    const info = generateDisplayNodesInfo();
    const offset = domUtil.getTextNodeDisplayOffset(info.nodes.i1Text, info.divTextNodesDisplayInfo);
    expect(offset).toBe(10);
});

test("getTextNodeDisplayOffset", () => {
    const info = generateDisplayNodesInfo();
    const offset = domUtil.getTextNodeDisplayOffset(info.nodes.i2Text, info.divTextNodesDisplayInfo);
    expect(offset).toBe(32);
});

test("getTextNodeDisplayOffset", () => {
    const info = generateDisplayNodesInfo();
    const offset = domUtil.getTextNodeDisplayOffset(info.nodes.i3Text, info.divTextNodesDisplayInfo);
    expect(offset).toBe(52);
});
*/

test("filterTextNodes returns single text node", () => {
    let dom = generateBaseDOM();
    let div = dom.window.document.getElementsByTagName("div")[0];
    let textNode = div.childNodes[0];
    let nodes : Array<Node> = [div, textNode]
    expect(domUtil.filterTextNodes(nodes)[0]).toBe(textNode);
});

test("filterTextNodes returns empty list", () => {
    let dom = generateBaseDOM();
    let div = dom.window.document.getElementsByTagName("br")[0];
    let textNode = div.childNodes[0];
    let nodes : Array<Node> = [div]
    expect(domUtil.filterTextNodes(nodes).length).toBe(0);
})

test("getElementXpath returns div xpath", () => {
    let dom = generateBaseDOM();
    let ele = dom.window.document.getElementsByTagName("div")[0];
    expect(domUtil.getElementXpath(ele)).toBe("/html[1]/body[1]/div[1]");
});

test("getElementXpath returns xpath for paragraph with id", () => {
    let dom = generateComplexDOM();
    let ele = dom.window.document.getElementsByTagName("p")[0];
    expect(domUtil.getElementXpath(ele)).toBe("/html[1]/body[1]/div[@id=\"text1\"]/p[@id=\"para1\"]");
});

test("getElementXpath returns xpath for paragraph with class", () => {
    let dom = generateComplexDOM();
    let ele = dom.window.document.getElementsByTagName("p")[1];
    expect(domUtil.getElementXpath(ele)).toBe("/html[1]/body[1]/div[@id=\"text1\"]/p[2]");
});

test("getXpathElement returns div xpath", () => {
    let dom = generateBaseDOM();
    let ele = dom.window.document.getElementsByTagName("div")[0];
    expect(domUtil.getXpathElement("/html[1]/body[1]/div[1]", dom.window.document)).toBe(ele);
});

test("getDescentdants on body returns #text, div and br", () => {
    let dom = generateBaseDOM();
    expect(domUtil.getDescendants(dom.window.document.body).length).toBe(3);
});

test("getDescentdants on br returns empty list", () => {
    let dom = generateBaseDOM();
    let br = dom.window.document.getElementsByTagName("br")[0];
    expect(domUtil.getDescendants(br).length).toBe(0);
});

test("getCommonAncestor of p 1 and p 2 returns body:", () => {
    let dom = generateComplexDOM();
    let div = dom.window.document.getElementsByTagName("div")[0];
    let p1 = dom.window.document.getElementsByTagName("p")[0];
    let p2 = dom.window.document.getElementsByTagName("p")[1];
    let ancestor = domUtil.getCommonAncestor(p1, p2);
    expect(ancestor).toBe(div);
});

test("getCommonAncestor of p 2 and br returns p 2:", () => {
    let dom = generateComplexDOM();
    let br = dom.window.document.getElementsByTagName("br")[0];
    let p2 = dom.window.document.getElementsByTagName("p")[1];
    let ancestor = domUtil.getCommonAncestor(br, p2);
    expect(ancestor).toBe(p2);
});

test("getCommonAncestor of p 1 and br returns body:", () => {
    let dom = generateComplexDOM();
    let div = dom.window.document.getElementsByTagName("div")[0];
    let br = dom.window.document.getElementsByTagName("br")[0];
    let p1 = dom.window.document.getElementsByTagName("p")[0];
    let ancestor = domUtil.getCommonAncestor(br, p1);
    expect(ancestor).toBe(div);
});

test("getCommonAncestor of p 1 and p 1 returns p 1:", () => {
    let dom = generateComplexDOM();
    let p1 = dom.window.document.getElementsByTagName("p")[0];
    let ancestor = domUtil.getCommonAncestor(p1, p1);
    expect(ancestor).toBe(p1);
});

test("getCommonAncestor of p 1 and document returns null:", () => {
    let dom = generateComplexDOM();
    let p1 = dom.window.document.getElementsByTagName("p")[0];
    let ancestor = domUtil.getCommonAncestor(p1, dom.window.document);
    expect(ancestor).toBe(null);
});

test("getCommonAncestor of document and p 1 returns null:", () => {
    let dom = generateComplexDOM();
    let p1 = dom.window.document.getElementsByTagName("p")[0];
    let ancestor = domUtil.getCommonAncestor(dom.window.document, p1);
    expect(ancestor).toBe(null);
});

test("getPreviousTextNode throws error if non-text node is passed", () => {
    let dom = generateComplexDOM();
    let p2 = dom.window.document.getElementsByTagName("p")[1];
    let textNode = p2.childNodes[0];
    let error = null;
    try {
        domUtil.getPreviousTextNode(p2, dom.window.document.body)
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);

});

test("getPreviousTextNode returns first text node of p2 when second text node is passed", () => {
    let dom = generateComplexDOM();
    let p2 = dom.window.document.getElementsByTagName("p")[1];
    let textNode1 = p2.childNodes[0];
    let textNode2 = p2.childNodes[2];
    expect(domUtil.getPreviousTextNode(textNode2, dom.window.document.body)).toBe(textNode1);
});

test("getPreviousTextNode returns empty text element when p2 first text node is passed", () => {
    let dom = generateComplexDOM();
    let p1 = dom.window.document.getElementsByTagName("p")[0];
    let p2 = dom.window.document.getElementsByTagName("p")[1];
    let div = dom.window.document.getElementsByTagName("div")[0];
    let textNode1 = div.childNodes[2];
    let textNode2 = p2.childNodes[0];
    expect(domUtil.getPreviousTextNode(textNode2, dom.window.document.body)).toBe(textNode1);
});

test("getPreviousTextNode returns null when first text node of scope is passed", () => {
    let dom = generateComplexDOM();
    let p1 = dom.window.document.getElementsByTagName("p")[0];
    let textNode1 = p1.childNodes[0];
    expect(domUtil.getPreviousTextNode(textNode1, p1)).toBe(null);
});



