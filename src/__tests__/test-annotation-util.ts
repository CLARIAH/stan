import AnnotationUtil, { IDUtil, ObjectUtil } from "../util/annotation-util";
import jsdom from "jsdom";
import fs from "fs";
const { JSDOM } = jsdom;
import RDFaUtil, { Context, PrefixDict, RDFaProperties } from '../util/extract-rdfa-util';
import Target from "../model/Target"
import { makeSelector, NestedPIDElement, SelectorType } from "../model/Selector";
import { defaultConfig } from "../model/ClientConfig";
import { MouseSelection } from "../util/extract-selection-util";
import { config } from "process";

const rdfaUtil = new RDFaUtil();

const getRDFaHTMLSource = () => {
    return fs.readFileSync("./test_examples/test_rdfa_page.html", "utf-8");
}

const generateRDFaDOM = () => {
    const htmlSource = getRDFaHTMLSource();
    const dom = new JSDOM(htmlSource, { pretendToBeVisual: true });
    return dom;
}

const globalVocabulary = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl";
const makeContext = () => {
    const context = rdfaUtil.makeEmptyContext();
    context.vocabulary = globalVocabulary;
    return context;
}

const generateRegistry = () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[1];
    const registry = rdfaUtil.registerRDFaResources(rdfaRootNode);
    return registry;
}


describe("AnnotationUtil", () => {

    beforeEach(() => {
        defaultConfig.useRDFaIdentifiers = false;
        defaultConfig.useNestedPIDSelector = false;
    })

    it("should return an AnnotationUtil object through constructor", (done) => {
        const config = defaultConfig;
        const registry = generateRegistry();
        const util = new AnnotationUtil(config, registry);
        expect(util.config.useRDFaIdentifiers).toBe(config.useRDFaIdentifiers);
        done();
    })
    describe("listMotivations", () => {

        it("should return an array", (done) => {
            const motivations = AnnotationUtil.listMotivations();
            expect(Array.isArray(motivations)).toBe(true);
            done();
        })

        it("should return an array of strings, including 'assessing'", (done) => {
            const motivations = AnnotationUtil.listMotivations();
            expect(motivations.includes("assessing")).toBe(true);
            done();
        })
    })

    describe("makeWindowTarget", () => {

        it("should return a target", (done) => {
            const annotationUtil = new AnnotationUtil(defaultConfig, null);
            const target = annotationUtil.makeWindowTarget();
            expect(target).not.toBe(null);
            done();
        })
    })

    describe("makeTarget", () => {

        it("should return a target with id for plain DOM and no use of RDFa", (done) => {
            const annotationUtil = new AnnotationUtil(defaultConfig, null);
            const target = annotationUtil.makeTarget();
            if (target instanceof Target) {
                expect(target.id).not.toBe(null)
            }
            done();
        })

        it("should throw an error when making a target with RDFa identifiers without a registry", (done) => {
            defaultConfig.useRDFaIdentifiers = true;
            const annotationUtil = new AnnotationUtil(defaultConfig, null);
            let error = null;
            try {
                annotationUtil.makeTarget();

            } catch (err) {
                error = err;
            }
            expect(error).not.toBe(null);
            done();
        })

        it("should return a target with a list of IDs for a multi-resource RDFa page", (done) => {
            defaultConfig.useRDFaIdentifiers = true;
            const dom = generateRDFaDOM();
            const para = dom.window.document.getElementsByTagName("div")[5];
            para.setAttribute('typeof', 'Sub')
            const registry = rdfaUtil.registerRDFaResources(dom.window.document.body);
            const annotationUtil = new AnnotationUtil(defaultConfig, registry);
            const target = annotationUtil.makeTarget();
            expect(Array.isArray(target)).toBe(true)
            if (Array.isArray(target)) {
                expect(target.length > 0).toBe(true);
            }
            done();
        })
    })
    
    describe("makeRDFaTargetWithTextSelection", () => {

        it("should return a target with RDFa resource as identifer", (done) => {
            defaultConfig.useRDFaIdentifiers = true;
            const dom = generateRDFaDOM();
            // make a mouse selection
            const div = dom.window.document.getElementsByTagName("div")[0];
            const para1 = dom.window.document.getElementsByTagName("p")[0];
            const para2 = dom.window.document.getElementsByTagName("p")[1];
            const topLevelResource = rdfaUtil.getRDFaResourceAttribute(div);
            const registry = rdfaUtil.registerRDFaResources(div);
            const annotationUtil = new AnnotationUtil(defaultConfig, registry);
            const selection: MouseSelection = {
                startNode: para1,
                startOffset: 10,
                endNode: para2,
                endOffset: 10
            }
            // make target
            const target = annotationUtil.makeRDFaTargetWithTextSelection(selection, registry);
            // expect target source to be smallest resource containing mouse selection
            expect(target.source).toBe(topLevelResource)
            done();
        })
    })

    describe("makeTargetFromRegistry", () => {

        it("should generate a plain target when not using NestedPID nor selector", (done) => {
            defaultConfig.useRDFaIdentifiers = true;
            const registry = generateRegistry();
            const annotationUtil = new AnnotationUtil(defaultConfig, registry);
            const resourceId = registry.topLevelResources[0];
            const target = annotationUtil.makeTargetFromRegistry(resourceId);
            expect(target.id).toBe(resourceId);
            done();
        })

        it("should generate a target with selector when using NestedPID without selection", (done) => {
            defaultConfig.useRDFaIdentifiers = true;
            defaultConfig.useNestedPIDSelector = true;
            const registry = generateRegistry();
            const annotationUtil = new AnnotationUtil(defaultConfig, registry);
            const resourceId = registry.topLevelResources[0];
            const target = annotationUtil.makeTargetFromRegistry(resourceId);
            expect(target.source).toBe(resourceId);
            expect(target.selector).not.toBe(undefined);
            if (target.selector) {
                expect(target.selector.type).toBe(SelectorType.NESTED_PID_SELECTOR)
            }
            done();
        })
    })

    describe("makeTargetFromId", () => {

        it("should return target with id equal to target string", (done) => {
            let targetId = 'some_id';
            const target = AnnotationUtil.makeTargetFromId(targetId);
            expect(target.id).toBe(targetId);
            done();
        })

        /*
        it("should accept only a targetId string", (done) => {
            let targetId = 'some_id';
            const annotation = AnnotationUtil.makeAnnotation(targetId);
            expect(annotation).not.toBe(null);
            done();
        })

        it("should return single target if target is a string", (done) => {
            let targetId = 'some_id';
            const annotation = AnnotationUtil.makeAnnotation(targetId);
            let targets = AnnotationUtil.extractTargets(annotation);
            expect(targets.length).toBe(1);
            done();
        })

        it("should return target string if target is a string", (done) => {
            let targetId = 'some_id';
            const annotation = AnnotationUtil.makeAnnotation(targetId);
            let targets = AnnotationUtil.extractTargets(annotation);
            expect(targets.length).toBe(1);
            expect(targets[0].id).toBe(targetId)
            done();
        })
        */

    })
    
    describe("constructNPIDElement", () => {

        it("should return a NestedPIDELement with properties from resource", (done) => {
            const resourceId = 'urn:div=2:sub=2';
            const registry = generateRegistry();
            const resource = registry.index[resourceId];
            const npid = AnnotationUtil.constructNPIDElement(resource);
            expect(npid.id).toBe(resourceId);
            done();
        })
    })

    describe("constructNPID", () => {

        it("should throw an error if id is not in registry", (done) => {
            const resourceId = 'urn:div=2:sub=3';
            const registry = generateRegistry();
            const annotationUtil = new AnnotationUtil(defaultConfig, registry);
            let error = null;
            try {
                annotationUtil.constructNPID(resourceId);
            } catch (err) {
                error = err;
            }
            expect(error).not.toBe(null);
            done();
        })

        it("should accept a registered PID", (done) => {
            const resourceId = 'urn:div=2:sub=2';
            const registry = generateRegistry();
            const annotationUtil = new AnnotationUtil(defaultConfig, registry);
            const npid = annotationUtil.constructNPID(resourceId);
            expect(npid).not.toBe(null);
            done();
        })

        it("should accept a registered PID and return a non-empty NestedPID", (done) => {
            const resourceId = 'urn:div=2:sub=2';
            const registry = generateRegistry();
            const annotationUtil = new AnnotationUtil(defaultConfig, registry);
            const npid = annotationUtil.constructNPID(resourceId);
            expect(npid.length).not.toBe(0);
            done();
        })

        it("should return a NestedPID with mulitple elements", (done) => {
            const resourceId = 'urn:div=2:sub=2';
            const registry = generateRegistry();
            const annotationUtil = new AnnotationUtil(defaultConfig, registry);
            const npid = annotationUtil.constructNPID(resourceId);
            expect(npid.length).toBe(2);
            done();
        })
    })

    describe("extractTargetId", () => {

        it("should throw an error if target has neither id nor source property", (done) => {
            const target = new Target();
            let error = null;
            try {
                AnnotationUtil.extractTargetId(target);
            } catch(err) {
                error = err;
            }
            expect(error).not.toBe(null);
            done();
        })

        it("should return id if target has id property", (done) => {
            const target = Target.construct({id: "urn:div=2"});
            const targetId = AnnotationUtil.extractTargetId(target);
            expect(targetId).toBe(target.id);
            done();
        })
    })

    describe("extractNestedPIDTargetId", () => {

        it("should throw an error when a non-NestedPID selector is passed", (done) => {
            const selector = makeSelector(SelectorType.XPATH_SELECTOR, {xpath: "/html/body/div[1]"});
            const target = Target.construct({
                source: "http://example.com",
                selector: selector
            })
            let error = null;
            try {
                AnnotationUtil.extractNestedPIDTargetIds(target);
            } catch (err) {
                error = err;
            }
            expect(error).not.toBe(null);
            done();
        })

        it("should throw an error when an invalid NestedPID selector is passed", (done) => {
            const element = {type: "Work", property: null};
            //const selector = makeSelector(SelectorType.NESTED_PID_SELECTOR, {value: [element]});
            const selector = {
                type: SelectorType.NESTED_PID_SELECTOR,
                value: [element]
            }
            const target = Target.construct({
                source: "http://example.com",
                selector: selector
            })
            let error = null;
            try {
                AnnotationUtil.extractNestedPIDTargetIds(target);
            } catch (err) {
                error = err;
            }
            expect(error).not.toBe(null);
            done();
        })

        it("should return a selector when a NestedPID selector is passed", (done) => {
            const element = new NestedPIDElement("urn:div=2", "Work", null)
            const selector = makeSelector(SelectorType.NESTED_PID_SELECTOR, {value: [element]});
            const target = Target.construct({
                source: "http://example.com",
                selector: selector
            })
            const targetIds = AnnotationUtil.extractNestedPIDTargetIds(target);
            expect(targetIds.length).not.toBe(0);
            done();
        })
    })

})

describe("IDUtil", () => {


    describe("__s4", () => {

        it("should return a random 4 character string", (done) => {
            const s4 = IDUtil.__s4();
            expect(s4.length).toBe(4)
            done();
        })
    })

    describe("guid", () => {

        it("should return a valid guid", (done) => {
            const guid = IDUtil.guid();
            expect(guid.length).toBe(36)
            done();
        })
    })

    describe("hashcode", () => {

        it("should return a stable hashcode", (done) => {
            const t1 = IDUtil.hashCode('test');
            const t2 = IDUtil.hashCode('test');
            expect(t1).toBe(t2)
            done();
        })
    })

})

describe("ObjectUtil", () => {

    describe("clone", () => {

        it("should return a different object", (done) => {
            const a = {'name': 'object', 'id': 1234};
            const b = ObjectUtil.clone(a);
            expect(a).not.toBe(b);
            done();
        })

        it("should return a different object with the same properties", (done) => {
            const a = {'name': 'object', 'id': 1234};
            const b = ObjectUtil.clone(a);
            expect(a.name).toBe(b.name);
            expect(a.id).toBe(b.id);
            done();
        })
    })

    describe("filterNullValues", () => {

        it("should leave non-null values intact", (done) => {
            const a = {name: 'some_object', 'id': 1234};
            const b = ObjectUtil.filterNullValues(a);
            expect(a.name).toBe(b.name);
            expect(a.id).toBe(b.id);
            done();
        })

        it("should remove null values", (done) => {
            const a = {name: 'some_object', id: null, type: undefined};
            const b = ObjectUtil.filterNullValues(a);
            expect(b.hasOwnProperty('name')).toBe(true)
            expect(b.hasOwnProperty('id')).toBe(false)
            expect(b.hasOwnProperty('type')).toBe(false)
            done();
        })
    })
})