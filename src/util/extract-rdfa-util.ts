import VocabularyRegistry from "../model/VocabularyRegistry";
import DomUtil from "./extract-dom-util";
import DOMUtil from "./extract-dom-util";



interface PrefixDict {
    [prefixString: string]: string;
}

interface RDFaProperties {
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

    hasRDFaResource (element: HTMLElement) {
        return element.hasAttribute(RDFaAttributeType.RESOURCE) || element.hasAttribute(RDFaAttributeType.ABOUT);
    }

    hasRDFaType (element: HTMLElement) {
        return element.hasAttribute(RDFaAttributeType.TYPEOF);
    }

    hasRDFaPrefix (element: HTMLElement) {
        return element.hasAttribute(RDFaAttributeType.PREFIX);
    }

    isIgnoreClass(rdfType: string, vocabularyRegistry: VocabularyRegistry) {
        let ignore = false;
        if (Array.isArray(rdfType)) {
            rdfType.forEach(type => {
                if (type === vocabularyRegistry.ignorableElementClass()) {
                    ignore = true;
                }
            })
        } else if (rdfType === vocabularyRegistry.ignorableElementClass()) {
            ignore = true;
        }
        return ignore;
    }

    setIgnoreElements(vocabularyRegistry: VocabularyRegistry) {
        //DOMUtil.prototype.getDescendants()
        //domU
        //if (rdfaAttrs.typeof && this.isIgnoreClass(rdfaAttrs.typeof, vocabularyRegistry)) {
        //}
    }

    setIgnoreElement(element: HTMLElement, vocabularyRegistry: VocabularyRegistry) {
        const rdfaAttrs = this.getRDFaAttributes(element);
        if (rdfaAttrs.typeof && this.isIgnoreClass(rdfaAttrs.typeof, vocabularyRegistry)) {
        }
    }
}