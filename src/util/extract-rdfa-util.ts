import VocabularyRegistry from "../model/VocabularyRegistry";
import DOMUtil from "./extract-dom-util";
import Resource, { ResourceRegistry } from "../model/Resource";
import StringUtil from "./extract-string-util";

const stringUtil = new StringUtil();
const domUtil = new DOMUtil();

export interface PrefixDict {
    [prefixString: string]: string;
}

export interface Context {
    parentResource: string | null;
    prefixDict: PrefixDict;
    vocabulary: string | null;
}

export interface RDFaProperties {
    about: string | null;
    resource: string | null;
    vocab: string | null;
    prefix: string| null;
    property: string | null;
    typeof: string | null;
}

enum RDFaAttributeType {
    ABOUT = "about",
    RESOURCE = "resource",
    VOCAB = "vocab",
    PREFIX = "prefix",
    PROPERTY = "property",
    TYPEOF = "typeof"
}


export default class RDFaUtil {
    
    getRDFaAttributes (element: HTMLElement) {
        const rdfaProperties: RDFaProperties = {
            about: element.getAttribute(RDFaAttributeType.ABOUT), 
            resource: element.getAttribute(RDFaAttributeType.RESOURCE),
            vocab: element.getAttribute(RDFaAttributeType.VOCAB),
            prefix: element.getAttribute(RDFaAttributeType.PREFIX),
            property: element.getAttribute(RDFaAttributeType.PROPERTY),
            typeof: element.getAttribute(RDFaAttributeType.TYPEOF)
        };
        if (!rdfaProperties.resource && rdfaProperties.about) {
            rdfaProperties.resource = rdfaProperties.about;
        }
        return rdfaProperties;
    }

    parsePrefixAttribute (prefixAttr: string | null) {
        const prefixDict: PrefixDict = { };
        if (prefixAttr) {
            const prefixParts = prefixAttr.split(/\s+/);
            if (prefixParts.length % 2 === 1) {
                throw Error("Error parsing prefixes: " + prefixAttr + "\nPrefixes should be whitespace separated list of prefix-name IRI pairs");
            }
            for (let i = 0; i < prefixParts.length; i += 2) {
                if (!this.isPrefixString(prefixParts[i])) {
                    throw Error("Invalid prefix: " + prefixParts[i] + "\nPrefix must be NCname followed by a single colon");
                }
                const vocPrefix = prefixParts[i].replace(/:/, "");
                prefixDict[vocPrefix] = prefixParts[i+1];
            }
        }
        return prefixDict;
    }

    isPrefixString(prefixString: string) {
        return prefixString.match(/^\w+:$/) !== null;
    }

    hasRDFaAttributes (element: HTMLElement) {
        return Object.keys(RDFaAttributeType).some(attr => {
            return element.hasAttribute(attr);
        })
    }

    hasRDFaResourceAttribute (element: HTMLElement) {
        return element.hasAttribute(RDFaAttributeType.RESOURCE) || element.hasAttribute(RDFaAttributeType.ABOUT);
    }

    hasRDFaTypeAttribute (element: HTMLElement) {
        return element.hasAttribute(RDFaAttributeType.TYPEOF);
    }

    hasRDFaPrefixAttribute (element: HTMLElement) {
        return element.hasAttribute(RDFaAttributeType.PREFIX);
    }

    makeEmptyContext() {
        const prefixDict: PrefixDict = {}
        const context: Context = {
            parentResource: null,
            prefixDict: prefixDict,
            vocabulary: null
        };
        return context;
    }

    setIgnoreElements(rootNode: Node, ignorableElementClass: string) {
        const context = this.makeEmptyContext();
        this.setIgnoreElementsRecursively(rootNode, ignorableElementClass, context);
    }

    setIgnoreElementsRecursively(node: Node, ignorableElementClass: string, context: Context) {
        if (node.nodeType !== window.Node.ELEMENT_NODE) { return false }
        const localContext = this.copyContext(node, context);
        const rdfaAttrs = this.getRDFaAttributes(<HTMLElement>node);
        if (rdfaAttrs.property && this.parsePropertyAttribute(rdfaAttrs.property, localContext) === ignorableElementClass) {
            this.setIgnoreElement(<HTMLElement>node); // sets ignorable for all descendants
        } else {
            node.childNodes.forEach(childNode => {
                this.setIgnoreElementsRecursively(childNode, ignorableElementClass, localContext);
            });
        }
    }

    setIgnoreElement(element: HTMLElement) {
        element.style.webkitUserSelect = "none";
        element.style.cursor = "not-allowed";
    }

    registerRDFaResources(rdfaRootNode: Node) {
        const prefixDict: PrefixDict = {};
        let parentResource: string = '';
        let vocabulary: string = '';
        const context: Context = {
            parentResource: parentResource,
            prefixDict: prefixDict,
            vocabulary: vocabulary
        }
        const resourceList = this.parseRDFaResources(rdfaRootNode, context);
        const resourceRegistry: ResourceRegistry = {};
        resourceList.forEach(resource => {
            resourceRegistry[resource.id] = resource;
        });
        return resourceRegistry;
    }

    parseRDFaResources(node: Node, context: Context) {
        const resources: Array<Resource> = [];
        if (node.nodeType !== window.Node.ELEMENT_NODE) {
            return resources;
        } 
        const localContext = this.copyContext(node, context);
        if (this.hasRDFaResourceAttribute(<HTMLElement>node)) {
            const resource = this.parseRDFaResource(node, localContext);
            resources.push(resource);
            localContext.parentResource = resource.id;
        }
        node.childNodes.forEach(childNode => {
            if (childNode.nodeType !== window.Node.ELEMENT_NODE) return false;
            this.parseRDFaResources(childNode, localContext).forEach(resource => {
                resources.push(resource);
            });
        });
        return resources;
    }

    copyContext(node: Node, context: Context) {
        // copy parent context to current node context, so parent context doesn't change
        const localPrefixDict: PrefixDict = {};
        Object.keys(context.prefixDict).forEach(prefix => {
            // copy registered prefixes
            localPrefixDict[prefix] = context.prefixDict[prefix];
        });
        const rdfaAttrs = this.getRDFaAttributes(<HTMLElement>node);
        if (rdfaAttrs.prefix) {
            // if this node has prefixes, register them, overwritting existing prefixes if they overlap
            const newPrefixDict = this.parsePrefixAttribute(rdfaAttrs.prefix);
            Object.keys(newPrefixDict).forEach(prefix => {
                localPrefixDict[prefix] = newPrefixDict[prefix];
            });
        }
        const localContext: Context = {
            parentResource: context.parentResource,
            vocabulary: context.vocabulary,
            prefixDict: localPrefixDict
        };
        if (rdfaAttrs.vocab) {
            // if this node sets a new vocabulary, update the local context
            localContext.vocabulary = rdfaAttrs.vocab;
        }
        return localContext;
    }

    parseRDFaResource(node: Node, context: Context) {
        const rdfaAttrs = this.getRDFaAttributes(<HTMLElement>node);
        const text = (node.textContent) ? node.textContent : "";
        if (!rdfaAttrs.resource || !rdfaAttrs.typeof) {
            throw Error("Cannot register resource without identifier or type");
        }
        const typeIRI = this.parseTypeAttribute(rdfaAttrs.typeof, context);
        const propertyIRI = this.parsePropertyAttribute(rdfaAttrs.property, context);
        const resource = new Resource(node, rdfaAttrs.resource, typeIRI, propertyIRI, context.parentResource, true, text);
        return resource;
    }

    parseTypeAttribute(rdfaTypeString: string, context: Context) {
        if (rdfaTypeString.includes(" ")) {
            const rdfaTypeStrings = rdfaTypeString.split(" ");
            return rdfaTypeStrings.map(rdfaTypeString => {
                return this.makeTypeIRI(rdfaTypeString, context);
            });
        } else {
            return this.makeTypeIRI(rdfaTypeString, context);
        }
    }

    parsePropertyAttribute(rdfaPropertyString: string | null, context: Context) {
        if (!rdfaPropertyString) {return null }
        return this.makeTypeIRI(rdfaPropertyString, context);
    }

    makeTypeIRI(rdfaType: string, context: Context) {
        if (this.hasRDFaTypePrefix(rdfaType)) {
            return this.makePrefixedTypeIRI(rdfaType, context);
        } else if (stringUtil.isURL(rdfaType)) {
            return rdfaType;
        } else {
            if (!context.vocabulary) {
                throw Error("Cannot turn literal into IRI - no vocabulary specified:" + rdfaType);
            }
            return this.makeLiteralTypeIRI(rdfaType, context.vocabulary);
        } 
    }

    isLiteral(rdfString: string) {
        return rdfString.match(/:/) === null;
    }

    makeLiteralTypeIRI(rdfaType: string, vocabulary: string) {
        if (vocabulary.endsWith("#")) {
            return vocabulary + rdfaType;
        } else if (vocabulary.endsWith("/")) {
            return vocabulary + rdfaType;
        } else {
            return vocabulary + "#" + rdfaType;
        }
    }

    hasRDFaTypePrefix(rdfaType: string) {
        return rdfaType.match(/^\w+:\w/) !== null;
    }

    makePrefixedTypeIRI(rdfaType: string, context: Context) {
        const prefix = rdfaType.replace(/:.*/, "");
        const typeLiteral = rdfaType.replace(/^.*?:/, "");
        if (!context.prefixDict[prefix]) {
            throw Error("Unknown prefix in typeof string: " + rdfaType);
        }
        if (context.prefixDict[prefix].endsWith("#") || context.prefixDict[prefix].endsWith("/")) {
            return context.prefixDict[prefix] + typeLiteral;
        } else {
            return context.prefixDict[prefix] + "#" + typeLiteral;
        }
    }
}
