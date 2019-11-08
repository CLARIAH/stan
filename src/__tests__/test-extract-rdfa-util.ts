import RDFaUtil, { Context, PrefixDict, RDFaProperties } from '../util/extract-rdfa-util';
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
        <div about="urn:div=1" vocab="http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl" typeof="Work">
            <p resource="urn:div=1:para=1" typeof="PartOfWork" property="hasWorkPart">first paragraph with <span resource="urn:div=1:para=1:name=1" typeof="Name" property="MentionedIn">A. Person Name</span>.</p>
            <p resource="urn:div=1:para=2" typeof="PartOfWork selectWholeElement" property="hasWorkPart">second graph<br/>with a second line</p>
        </div>
        <div about="urn:div=2" prefix="hi: http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl# vg: http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#" typeof="hi:Work">
            <p>This text has a footnote<sup property="hi:IgnorableElement">a</sup> that should be ignored.</p>
            <div resource="urn:div=2:sub=1" prefix="vg: http://boot.huygens.knaw.nl/vgdemo/vangoghcorrespondenceontology.ttl#" typeof="vg:Paragraph">
                this sub has no RDFa property.
            </div>
            <div resource="urn:div=2:sub=2" typeof="vg:Paragraph">
                this sub reuses the same prefix for a different vocabulary.
            </div>
        </div>
        <div about="urn:div=3" vocab="http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#" typeof="Work">
            <div resource="urn:div=2:sub=3">
                this sub has no type.
            </div>
        </div>
        </body></html>`;
    const dom = new JSDOM(htmlSource, { pretendToBeVisual: true });
    let window = dom.window;
    return dom;
}

const globalVocabulary = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl";
const makeContext = () => {
    const context = rdfaUtil.makeEmptyContext();
    context.vocabulary = globalVocabulary;
    return context;
}


test("RDFaProperties interface", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName("div")[0];
    const rdfaAttrs = rdfaUtil.getRDFaAttributes(div);
    const rdfaProps: RDFaProperties = {
        about: rdfaAttrs.about,
        vocab: rdfaAttrs.vocab,
        resource: rdfaAttrs.resource,
        prefix: rdfaAttrs.prefix,
        property: rdfaAttrs.property,
        typeof: rdfaAttrs.typeof
    };
    expect(rdfaProps).not.toBe(null);
});

test("makeEmptyContext returns an empty context", () => {
    const context = rdfaUtil.makeEmptyContext();
    expect(context.vocabulary).toBe(null);
    expect(context.parentResource).toBe(null);
    expect(Object.keys(context.prefixDict).length).toBe(0);
})

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

test("getRDFaAttributes of element with no property returns object with empty property value", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[2];
    const attributes = rdfaUtil.getRDFaAttributes(div);
    expect(attributes.property).toBe(null);
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
    expect(rdfaUtil.hasRDFaResourceAttribute(p)).toBe(false);
});

test("hasRDFaResource of element with resource attribute returns true", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaResourceAttribute(p)).toBe(true);
});

test("hasRDFaResource of element with about attribute returns true", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[0];
    expect(rdfaUtil.hasRDFaResourceAttribute(div)).toBe(true);
});

test("hasRDFaType of element without typeof attribute returns false", () => {
    const dom = generatePlainDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaTypeAttribute(p)).toBe(false);
});

test("hasRDFaType of element with typeof attribute returns true", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaTypeAttribute(p)).toBe(true);
});

test("hasRDFaPrefix of element without prefix attribute returns false", () => {
    const dom = generatePlainDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaPrefixAttribute(p)).toBe(false);
});

test("hasRDFaPrefix of element with prefix attribute returns true", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[1];
    expect(rdfaUtil.hasRDFaPrefixAttribute(div)).toBe(true);
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

test("parsePropertyAttribute returns an IRI of a property literal", () => {
    const propertyAttribute = "hasWorkPart";
    const context = makeContext();
    const propertyIRI = rdfaUtil.parsePropertyAttribute(propertyAttribute, context);
    const expectedIRI = context.vocabulary + "#" + propertyAttribute;
    expect(propertyIRI).toBe(expectedIRI);
});

test("parsePropertyAttribute returns an IRI of a prefixed property", () => {
    const propertyLiteral = "hasWorkPart";
    const prefix = "hi";
    const propertyAttribute = prefix + ":" + propertyLiteral;
    const context = makeContext();
    context.prefixDict[prefix] = globalVocabulary;
    const propertyIRI = rdfaUtil.parsePropertyAttribute(propertyAttribute, context);
    const expectedIRI = context.vocabulary + "#" + propertyLiteral;
    expect(propertyIRI).toBe(expectedIRI);
});


test("setIgnoreElement sets UserSelect to none", () => {
    const dom = generateRDFaDOM();
    const sup = dom.window.document.getElementsByTagName("sup")[0];
    rdfaUtil.setIgnoreElement(sup);
    expect(sup.style.cursor).toBe("not-allowed");
})

test("setIgnoreElementsRecursively sets UserSelect of sup element to none", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[1];
    const sup = dom.window.document.getElementsByTagName("sup")[0];
    const context = makeContext();
    const ignorableElementClass = context.vocabulary + "#IgnorableElement";
    expect(sup.style.cursor).not.toBe("not-allowed");
    console.log("TEST - ignorableElementClass:", ignorableElementClass);
    rdfaUtil.setIgnoreElementsRecursively(rdfaRootNode, ignorableElementClass, context);
    expect(sup.style.cursor).toBe("not-allowed");
});

test("setIgnoreElements sets UserSelect of sup element to none", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[1];
    const sup = dom.window.document.getElementsByTagName("sup")[0];
    const context = makeContext();
    const ignorableElementClass = context.vocabulary + "#IgnorableElement";
    expect(sup.style.cursor).not.toBe("not-allowed");
    rdfaUtil.setIgnoreElements(rdfaRootNode, ignorableElementClass);
    expect(sup.style.cursor).toBe("not-allowed");
});


test("hasRDFaTypePrefix return false if only literal is passed", () => {
    const rdfaTypeString = "Work";
    expect(rdfaUtil.hasRDFaTypePrefix(rdfaTypeString)).toBe(false);
});

test("hasRDFaTypePrefix return false if full IRI is passed", () => {
    const context = makeContext();
    const rdfaTypeString = context.vocabulary + "#Work";
    expect(rdfaUtil.hasRDFaTypePrefix(rdfaTypeString)).toBe(false);
});

test("hasRDFaTypePrefix return true if prefixed literal is passed", () => {
    const context = makeContext();
    if (!context.vocabulary) { return false } // just so typescript won't complain
    context.prefixDict["pre"] = context.vocabulary;
    const rdfaTypeString = "pre:Work";
    expect(rdfaUtil.hasRDFaTypePrefix(rdfaTypeString)).toBe(true);
});

test("isLiteral returns false when rdfaTypeString is prefixed", () => {
    const rdfaTypeString = "pre:Work";
    expect(rdfaUtil.isLiteral(rdfaTypeString)).toBe(false);
})

test("isLiteral returns false when rdfaTypeString is IRI", () => {
    const context = makeContext();
    const rdfaTypeString = context.vocabulary + "#Work";
    expect(rdfaUtil.isLiteral(rdfaTypeString)).toBe(false);
})

test("isLiteral returns true when rdfaTypeString is literal", () => {
    const rdfaTypeString = "Work";
    expect(rdfaUtil.isLiteral(rdfaTypeString)).toBe(true);
})

test("makeLiteralTypeIRI adds a # when vocabulary ends in alphanumeric character", () => {
    const context = makeContext();
    const rdfaTypeString = "Work";
    if (!context.vocabulary) { return false } // just so typescript won't complain
    const typeIRI = rdfaUtil.makeLiteralTypeIRI(rdfaTypeString, context.vocabulary);
    expect(typeIRI).toBe(context.vocabulary + "#Work");
})

test("makeLiteralTypeIRI adds nothing when vocabulary ends in #", () => {
    const context = makeContext();
    const rdfaTypeString = "Work";
    context.vocabulary += "#";
    if (!context.vocabulary) { return false } // just so typescript won't complain
    const typeIRI = rdfaUtil.makeLiteralTypeIRI(rdfaTypeString, context.vocabulary);
    expect(typeIRI).toBe(context.vocabulary + "Work");
})

test("makeLiteralTypeIRI adds nothing when vocabulary ends in /", () => {
    const context = makeContext();
    const rdfaTypeString = "Work";
    context.vocabulary += "/";
    if (!context.vocabulary) { return false } // just so typescript won't complain
    const typeIRI = rdfaUtil.makeLiteralTypeIRI(rdfaTypeString, context.vocabulary);
    expect(typeIRI).toBe(context.vocabulary + "Work");
})

test("makeTypeIRI throws error when type is literal and no vocabulary is specified", () => {
    const context = makeContext();
    const rdfaTypeString = "Work";
    context.vocabulary = null;
    let error = null;
    try {
        rdfaUtil.makeTypeIRI(rdfaTypeString, context);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
})

test("makeTypeIRI throws an error if type has prefix and the context has no prefix", () => {
    const context = makeContext();
    context.vocabulary = null;
    const rdfaTypeString = "pre:Work";
    let error = null;
    try {
        rdfaUtil.makeTypeIRI(rdfaTypeString, context);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
})

test("makeTypeIRI returns rdfaTypeString when rdfaTypeString is IRI", () => {
    const context = makeContext();
    const rdfaTypeString = context.vocabulary + "#Work";
    expect(rdfaUtil.makeTypeIRI(rdfaTypeString, context)).toBe(rdfaTypeString);
})

test("makePrefixedTypeIRI throws an error if literal prefix is not in prefixDict", () => {
    const context = makeContext();
    if (!context.vocabulary) { return false } // just so typescript won't complain
    const rdfaTypeString = "pre:Work";
    let error = null;
    try {
        rdfaUtil.makePrefixedTypeIRI(rdfaTypeString, context);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
});

test("makePrefixedTypeIRI returns type IRI if prefixed literal is passed", () => {
    const context = makeContext();
    if (!context.vocabulary) { return false } // just so typescript won't complain
    context.prefixDict["pre"] = context.vocabulary;
    const rdfaTypeString = "pre:Work";
    const typeIRI = rdfaUtil.makePrefixedTypeIRI(rdfaTypeString, context);
    expect(typeIRI).toBe(context.vocabulary + "#Work");
});

test("makePrefixedTypeIRI returns type IRI if prefixed literal is passed", () => {
    const context = makeContext();
    if (!context.vocabulary) { return false } // just so typescript won't complain
    context.prefixDict["pre"] = context.vocabulary + "#";
    const rdfaTypeString = "pre:Work";
    const typeIRI = rdfaUtil.makePrefixedTypeIRI(rdfaTypeString, context);
    expect(typeIRI).toBe(context.vocabulary + "#Work");
});

test("copyContext returns a copy of context with same values", () => {
    const context = makeContext();
    const dom = generateRDFaDOM();
    const copiedContext = rdfaUtil.copyContext(dom.window.document.body, context);
    expect(copiedContext.parentResource).toBe(context.parentResource);
    expect(copiedContext.vocabulary).toBe(context.vocabulary);
    expect(copiedContext).not.toBe(context);
});

test("copyContext returns a copy of context with updated values if node sets new vocabulary", () => {
    const context = rdfaUtil.makeEmptyContext();
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const copiedContext = rdfaUtil.copyContext(rdfaRootNode, context);
    expect(copiedContext.vocabulary).not.toBe(context.vocabulary);
});

test("parseTypeAttribute returns a list of type IRIs if typeof attribute has multiple types", () => {
    const dom = generateRDFaDOM();
    const multitypeResrouce = dom.window.document.getElementsByTagName("p")[1];
    const rdfaAttrs = rdfaUtil.getRDFaAttributes(multitypeResrouce);
    if (!rdfaAttrs.typeof) { return false }
    const context = makeContext();
    const typeIRI = rdfaUtil.parseTypeAttribute(rdfaAttrs.typeof, context);
    expect(Array.isArray(typeIRI)).toBe(true);
    expect(typeIRI.length).toBe(2);
});

test("registerRDFaResource throws an error if node has no RDFa resource identifier", () => {
    const dom = generatePlainDOM();
    const rdfaRootNode = dom.window.document;
    const context = makeContext();
    let error = null;
    try {
        rdfaUtil.registerRDFaResource(rdfaRootNode, context);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
});

test("registerRDFaResource throws an error if node has no RDFa type", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[2];
    const context = makeContext();
    let error = null;
    try {
        rdfaUtil.registerRDFaResource(rdfaRootNode, context);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
});

test("registerRDFaResource returns a resource object if resource has identifier and type", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    const resource = rdfaUtil.registerRDFaResource(rdfaRootNode, context);
    expect(resource).not.toBe(null);
});

test("registerRDFaResource returns a resource object with no parent if resource has no parent", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    const resource = rdfaUtil.registerRDFaResource(rdfaRootNode, context);
    expect(resource.rdfaParent).toBe(null);
});

test("registerRDFaResource returns a resource object with no parent if resource has no parent", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    context.parentResource = "urn:i:am:the:parent";
    const resource = rdfaUtil.registerRDFaResource(rdfaRootNode, context);
    expect(resource.rdfaParent).toBe(context.parentResource);
});

test("registerRDFaResource returns a resource object with IRI of type", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    const typeIRI = context.vocabulary + "#" + rdfaUtil.getRDFaAttributes(rdfaRootNode).typeof;
    const resource = rdfaUtil.registerRDFaResource(rdfaRootNode, context);
    expect(resource.rdfType).toBe(typeIRI);
});

test("registerRDFaResource returns a resource object with list of types if resource has multiple types", () => {
    const dom = generateRDFaDOM();
    const multitypeResrouce = dom.window.document.getElementsByTagName("p")[1];
    const context = makeContext();
    const resource = rdfaUtil.registerRDFaResource(multitypeResrouce, context);
    expect(Array.isArray(resource.rdfType)).toBe(true);
    expect(resource.rdfType.length).toBe(2);
});

test("registerRDFaResource returns a resource object with no rdfaParent for top resource", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    const typeIRI = context.vocabulary + "#" + rdfaUtil.getRDFaAttributes(rdfaRootNode).typeof;
    const resource = rdfaUtil.registerRDFaResource(rdfaRootNode, context);
    expect(resource.rdfaParent).toBe(null);
});

test("registerRDFaResource returns a resource object with a rdfaParent for sub-resource", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const subresourceNode = dom.window.document.getElementsByTagName("p")[0];
    const context = makeContext();
    const rootNodeAttrs = rdfaUtil.getRDFaAttributes(rdfaRootNode);
    context.parentResource = rootNodeAttrs.resource;
    const resource = rdfaUtil.registerRDFaResource(subresourceNode, context);
    expect(resource.rdfaParent).toBe(rootNodeAttrs.resource);
});

test("registerRDFaResources returns an empty list is DOM has no RDFa", () => {
    const dom = generatePlainDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    const resources = rdfaUtil.registerRDFaResources(rdfaRootNode, context);
    expect(resources.length).toBe(0);
});

test("registerRDFaResources returns a list of resource objects", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    const resources = rdfaUtil.registerRDFaResources(rdfaRootNode, context);
    expect(resources.length).toBe(4);
});

test("registerRDFaResources returns a list of resource objects", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const subresourceNode = dom.window.document.getElementsByTagName("p")[0];
    const subresourceAttrs = rdfaUtil.getRDFaAttributes(subresourceNode);
    const context = makeContext();
    const resources = rdfaUtil.registerRDFaResources(rdfaRootNode, context);
    expect(resources[2].id).toBe("urn:div=1:para=1:name=1");
    expect(resources[2].rdfaParent).toBe(subresourceAttrs.resource);
});
test("registerRDFaResources returns a list of resource objects", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[1];
    const para1 = rdfaRootNode.getElementsByTagName("p")[0];
    const para2 = rdfaRootNode.getElementsByTagName("p")[1];
    //const para1Attrs = rdfaUtil.getRDFaAttributes(para1);
    //const para2Attrs = rdfaUtil.getRDFaAttributes(para2);
    const context = makeContext();
    context.vocabulary = null;
    const resources = rdfaUtil.registerRDFaResources(rdfaRootNode, context);
    expect(resources[1].rdfType).not.toBe(resources[2].rdfType);
});

test("makeRDFaResourceRegistry always returns a registry when there are no RDFa resources", () => {
    const dom = generatePlainDOM();
    const rdfaRootNode = dom.window.document.body;
    const registry = rdfaUtil.listRDFaResources(rdfaRootNode);
    expect(registry).not.toBe(null);
    //expect(Object.keys(registry))
})

test("makeRDFaResourceRegistry returns an empty registry when there are no RDFa resources", () => {
    const dom = generatePlainDOM();
    const rdfaRootNode = dom.window.document.body;
    const registry = rdfaUtil.listRDFaResources(rdfaRootNode);
    expect(Object.keys(registry).length).toBe(0);
})

test("makeRDFaResourceRegistry returns an empty registry when passing a non-ELEMENT node", () => {
    const dom = generatePlainDOM();
    const rdfaRootNode = dom.window.document.body.childNodes[0];
    const registry = rdfaUtil.listRDFaResources(rdfaRootNode);
    expect(Object.keys(registry).length).toBe(0);
})

/*
*/