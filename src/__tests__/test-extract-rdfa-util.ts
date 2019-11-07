import RDFaUtil from '../util/extract-rdfa-util';
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const rdfaUtil = new RDFaUtil();

const generatePlainDOM = () => {
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

const generateRDFaDOM = () => {
    const htmlSource = `<html><body>
        <div about="urn:div=1" "vocab="http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl" typeof="Work">
            <p resource="urn:div=1:para=1" typeof="PartOfWork" property="hasWorkPart">first paragraph</p>
            <p resource="urn:div=1:para=2" typeof="PartOfWork selectWholeElement" property="hasWorkPart">second graph<br/>with a second line</p>
        </div>
        <div about="urn:div=2" prefix="hi: http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl">
            <p>This text has a footnote<sup property="IgnorableElement">a</sup> that should be ignored.</p>
        </div>
        </body></html>`;
    const dom = new JSDOM(htmlSource, { pretendToBeVisual: true });
    let window = dom.window;
    return dom;
}

test("getRDFaAttributes of element with no attributes returns object with null values", () => {
    const dom = generatePlainDOM();
    const div = dom.window.document.getElementsByTagName('div')[0];
    const attributes = rdfaUtil.getRDFaAttributes(div);
    expect(attributes.about).toBe(null);
});

test("getRDFaAttributes of element with about attribute returns object with about value", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[0];
    const attributes = rdfaUtil.getRDFaAttributes(div);
    expect(attributes.about).toBe("urn:div=1");
});

test("getRDFaAttributes of element with about attribute returns object with resource value", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[0];
    const attributes = rdfaUtil.getRDFaAttributes(div);
    expect(attributes.resource).toBe("urn:div=1");
});

test("getRDFaAttributes of element with property attribute returns object with property value", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    const attributes = rdfaUtil.getRDFaAttributes(p);
    expect(attributes.property).toBe("hasWorkPart");
});

test("getRDFaAttributes of element with single type value returns object with type value string", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    const attributes = rdfaUtil.getRDFaAttributes(p);
    expect(attributes.typeof).toBe("PartOfWork");
});

test("hasRDFaAttributes of element with no RDFa attribute returns false", () => {
    const dom = generateRDFaDOM();
    expect(rdfaUtil.hasRDFaAttributes(dom.window.document.body)).toBe(false);
});

test("hasRDFaAttributes of element with property attribute returns true", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaAttributes(p)).toBe(true);
});

test("hasRDFaResource of element without resource attribute returns false", () => {
    const dom = generatePlainDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaResource(p)).toBe(false);
});

test("hasRDFaResource of element with resource attribute returns true", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaResource(p)).toBe(true);
});

test("hasRDFaResource of element with about attribute returns true", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[0];
    expect(rdfaUtil.hasRDFaResource(div)).toBe(true);
});

test("hasRDFaType of element without typeof attribute returns false", () => {
    const dom = generatePlainDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaType(p)).toBe(false);
});

test("hasRDFaType of element with typeof attribute returns true", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaType(p)).toBe(true);
});

test("hasRDFaPrefix of element without prefix attribute returns false", () => {
    const dom = generatePlainDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaPrefix(p)).toBe(false);
});

test("hasRDFaPrefix of element with prefix attribute returns true", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[1];
    expect(rdfaUtil.hasRDFaPrefix(div)).toBe(true);
});

test("isPrefixString returns false if prefixString does not end with colon", () => {
    expect(rdfaUtil.isPrefixString("tt")).toBe(false);
});

test("isPrefixString returns false if prefixString does not end with colon", () => {
    expect(rdfaUtil.isPrefixString("tt: ")).toBe(false);
});

test("isPrefixString returns false if prefixString ends with multiple colons", () => {
    expect(rdfaUtil.isPrefixString("tt::")).toBe(false);
});

test("isPrefixString returns true if prefixString ends with single colon", () => {
    expect(rdfaUtil.isPrefixString("tt:")).toBe(true);
});

test("parsePrefix throws an error if an uneven number of parts is passed", () => {
    const prefixAttribute = "hi: http://example.com/ns# ba:";
    let error = null;
    try {
        rdfaUtil.parsePrefixAttribute(prefixAttribute);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
});

test("parsePrefix throws an error if prefix attribute contains an invalid prefix string", () => {
    const prefixAttribute = "hi:: http://example.com/ns#";
    let error = null;
    try {
        rdfaUtil.parsePrefixAttribute(prefixAttribute);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
});

test("parsePrefix returns a dict with a single prefix if attribute has one prefix", () => {
    const prefixAttribute = "hi: http://example.com/ns#";
    const prefixDict = rdfaUtil.parsePrefixAttribute(prefixAttribute);
    expect(prefixDict).not.toBe(null);
    expect(Object.keys(prefixDict).length).toBe(1);
});

test("parsePrefix returns a dict with hi prefix if attribute has hi prefix", () => {
    const prefixAttribute = "hi: http://example.com/ns#";
    const prefixDict = rdfaUtil.parsePrefixAttribute(prefixAttribute);
    expect(prefixDict.hasOwnProperty("hi")).toBe(true);
});

test("parsePrefix returns a dict with hi prefix url if attribute has hi prefix", () => {
    const prefixAttribute = "hi: http://example.com/ns#";
    const prefixDict = rdfaUtil.parsePrefixAttribute(prefixAttribute);
    expect(prefixDict.hi).toBe("http://example.com/ns#");
});

test("parsePrefix returns a dict with two prefixes if attribute has two prefixes", () => {
    const prefixAttribute = "hi: http://example.com/ns# ba: http://example.org/ns#";
    const prefixDict = rdfaUtil.parsePrefixAttribute(prefixAttribute);
    expect(prefixDict).not.toBe(null);
    expect(Object.keys(prefixDict).length).toBe(2);
});

test("parsePrefix returns a dict with two prefixes if prefixes are separated by multiple whitespaces", () => {
    const prefixAttribute = "hi: http://example.com/ns#     \nba: http://example.org/ns#";
    const prefixDict = rdfaUtil.parsePrefixAttribute(prefixAttribute);
    expect(prefixDict).not.toBe(null);
    expect(Object.keys(prefixDict).length).toBe(2);
});
