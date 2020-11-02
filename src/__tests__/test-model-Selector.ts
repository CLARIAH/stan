import Selector, { makeSelector, SelectorType, TextPositionSelector, TextQuoteSelector } from "../model/Selector";
import { FragmentSelector, NestedPIDElement, NestedPIDSelector, XPathSelector } from "../model/Selector"

test("accept basic selector", () => {
    const selector = new Selector(SelectorType.TEXT_POS_SELECTOR);
    expect(selector).not.toBe(null);
})

test("accept text position selector", () => {
    const selector = new TextPositionSelector(1, 2);
    expect(selector).not.toBe(null);
})

test("reject text position selector with negative start", () => {
    let error = null;
    try {
        new TextPositionSelector(-1, 2);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
})

test("reject text position selector with end before start", () => {
    let error = null;
    try {
        new TextPositionSelector(10, 2);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
})

test("accept fragment selector", () => {
    const selector = new FragmentSelector("#t=0,1", "http://www.w3.org/TR/media-frags/");
    expect(selector).not.toBe(null);
})

test("accept xpath selector", () => {
    const selector = new XPathSelector("/html/body/div[1]/p[1]");
    expect(selector).not.toBe(null);
})

test("accept text quote selector", () => {
    const selector = new TextQuoteSelector('middle', 'The ', ' word');
    expect(selector).not.toBe(null);
})

test("accept NestedPIDElement", () => {
    const resource = {id: 'id', type: 'type', property: 'property'};
    const element = new NestedPIDElement(resource.id, resource.type, resource.property);
    expect(element.id).toBe(resource.id)
})

test("accept NestedPidSelector", () => {
    const resource = {id: 'id', type: 'type', property: 'property'};
    const element = new NestedPIDElement(resource.id, resource.type, resource.property);
    const selector = new NestedPIDSelector([element]);
    expect(selector.context).not.toBe(null);
})

describe("makeSelector", () => {

    it("should return an XPathSelector", (done) => {
        const xpath = "/html/body/div[1]";
        const selector = makeSelector(SelectorType.XPATH_SELECTOR, {value: xpath});
        expect(selector.type).toBe(SelectorType.XPATH_SELECTOR);
        done();
    })

    it("should return an FragmentSelector", (done) => {
        const conformsTo = "http://www.w3.org/TR/media-frags/";
        const selector = makeSelector(SelectorType.FRAGMENT_SELECTOR, {value: "#t=10,20", conformsTo: conformsTo});
        expect(selector.type).toBe(SelectorType.FRAGMENT_SELECTOR);
        done();
    })

    it("should return an NestedPIDSelector", (done) => {
        const nestedPIDElement: NestedPIDElement = {id: 'some_id', type: "Work", property: null};
        const nestedPIDArray = [nestedPIDElement];
        const selector = makeSelector(SelectorType.NESTED_PID_SELECTOR, {value: nestedPIDArray});
        expect(selector.type).toBe(SelectorType.NESTED_PID_SELECTOR);
        done();
    })

    it("should throw an error when submitting an empty NestedPIDElement array", (done) => {
        const nestedPIDArray: Array<NestedPIDElement> = [];
        let error = null;
        try {
            makeSelector(SelectorType.NESTED_PID_SELECTOR, {value: nestedPIDArray});
        } catch (err) {
            error = err
        }
        expect(error).not.toBe(null);
        done();
    })

    it("should throw an error when submitting an invalid NestedPIDElement array", (done) => {
        let error = null;
        try {
            makeSelector(SelectorType.NESTED_PID_SELECTOR, {value: "some_string"});
        } catch (err) {
            error = err
        }
        expect(error).not.toBe(null);
        done();
    })

    it("should return an TextQuoteSelector", (done) => {
        const data = {exact: 'middle', prefix: 'The ', suffix: ' word'};
        const selector = makeSelector(SelectorType.TEXT_QUOTE_SELECTOR, data);
        expect(selector.type).toBe(SelectorType.TEXT_QUOTE_SELECTOR);
        done();
    })

    it("should return an XPathSelector", (done) => {
        const data = {start: 0, end: 1};
        const selector = makeSelector(SelectorType.TEXT_POS_SELECTOR, data);
        expect(selector.type).toBe(SelectorType.TEXT_POS_SELECTOR);
        done();
    })

    it("should throw an error when submitting an invalid NestedPIDElement array", (done) => {
        let error = null;
        try {
            makeSelector(SelectorType.NESTED_PID_SELECTOR, {value: "some_string"});
        } catch (err) {
            error = err
        }
        expect(error).not.toBe(null);
        done();
    })

})

describe("isNestedPIDElement", () => {

    it("should return false if element is not an object", (done) => {
        const element: NestedPIDElement = {id: 'some_id', type: "Work", property: null};
        const value = NestedPIDElement.isNestedPIDElement(element)
        expect(value).toBe(true);
        done();
    })
})
