import Resource, { ResourceRegistry } from "../model/Resource";
import { ClientConfig, HierarchicalRelation } from "../model/ClientConfig";
import { stringify } from "querystring";
import { isNullOrUndefined } from "util";

const $rdf = require("rdflib");
//const IndexedFormula = require("rdflib");
//const DataFactory = require("rdflib/lib/data-factory");
//const parse = require("rdflib/lib/parse");

interface LinkRef {
    url: string;
    type: string;
}

export interface InternalExternalMap {
    internal: string,
    external: string
}

interface HierarchicalRelations {
    includes: Array<string>,
    isIncludedIn: Array<string>
}

export default class ExternalRDFUtil {

    async readExternalResources(externalResourceURL: string) {
        let response = await fetch(externalResourceURL);
        let resourceData = await response.text();
        return resourceData;
    }

    async loadExternalResources(document: Document) {
        const externalStore = $rdf.graph();
        const linkRefs = this.getAlternateLinkRefs(document);
        let promises = linkRefs.map(async linkRef => {
            let resourceData = await this.readExternalResources(linkRef.url);
            $rdf.parse(resourceData, externalStore, linkRef.url, linkRef.type);
            return resourceData;
        });
        const _ = await Promise.all(promises);
        return externalStore;
    }

    async loadExternalResource(linkRef: LinkRef, externalStore: any) {
        const resourceData = await this.readExternalResources(linkRef.url);
        $rdf.parse(resourceData, externalStore, linkRef.url, linkRef.type);
        return "done";
    }

    async listExternalResources(externalStore: any, resourceRegistry: ResourceRegistry, config: ClientConfig) {
        if (!externalStore) {
            throw Error("externalStore needs to be initialized to index external resources.");
        }
        const externalResourceMap = this.mapInternalExternalResources(externalStore, resourceRegistry, config.representationRelations);
        const externalResources = this.parseExternalResourcesHierarchy(externalStore, externalResourceMap, config);
        return externalResources;
    }

    parseExternalResourcesHierarchy(externalStore: any, externalResourceMap: Array<InternalExternalMap>, config: ClientConfig) {
        const externalResources: Array<Resource> = [];
        externalResourceMap.forEach(map => {
            const externalResource = this.parseExternalResourceData(map.external, externalStore, config.hierarchicalRelations)
            const externalHierarchy = this.parseExternalResourceHierarchy(externalStore, externalResource, config.hierarchicalRelations);
            externalHierarchy.forEach(externalParent => {
                const skip = externalResources.some(resource => { return resource.id === externalParent.id });
                if (!skip) {
                    externalResources.push(externalParent);
                }
            });
        })
        return externalResources; 
    }

    parseExternalResourceHierarchy(externalStore: any, externalResource: Resource, hierarchicalRelations: Array<HierarchicalRelation>) {
        const externalResources: Array<Resource> = [];
        externalResources.push(externalResource);
        if (externalResource.rdfaParent) {
            const parentResource = this.parseExternalResourceData(externalResource.rdfaParent, externalStore, hierarchicalRelations);
            const parentResourceHierarchy = this.parseExternalResourceHierarchy(externalStore, parentResource, hierarchicalRelations);
            parentResourceHierarchy.forEach(parentResource => {
                externalResources.push(parentResource);
            });
        }
        return externalResources; 
    }

    resourceIncludes(relation: string, hierarchicalRelations: Array<HierarchicalRelation>) {
        return hierarchicalRelations.some(hierarchicalRelation => {
            if (relation === hierarchicalRelation.includes) {
                return true;
            } else {
                return false;
            }
        });
    }

    resourceIsIncludedIn(relation: string, hierarchicalRelations: Array<HierarchicalRelation>) {
        return hierarchicalRelations.some(hierarchicalRelation => {
            if (hierarchicalRelation.isIncludedIn && relation === hierarchicalRelation.isIncludedIn) {
                return true;
            } else {
                return false;
            }
        });
    }

    getInverseIncludes(relation: string, hierarchicalRelations: Array<HierarchicalRelation>) {
        let inverse = null;
        hierarchicalRelations.some(hierarchicalRelation => {
            if (relation === hierarchicalRelation.includes && hierarchicalRelation.isIncludedIn) {
                inverse = hierarchicalRelation.isIncludedIn;
                return true;
            } else if (hierarchicalRelation.isIncludedIn && relation === hierarchicalRelation.isIncludedIn) {
                inverse = hierarchicalRelation.includes;
                return true;
            } else {
                return false;
            }
        });
        return inverse;
    }

    parseExternalResourceData(resourceId: string, externalStore: any, hierarchicalRelations: Array<HierarchicalRelation>) {
        let parentId = null;
        let property = null;
        const types: Array<string> = [];
        const resourceNode = $rdf.sym(resourceId);
        externalStore.match(resourceNode, null, null).forEach((triple: any) => {
            if (this.resourceIsIncludedIn(triple.predicate.value, hierarchicalRelations)) {
                parentId = triple.object.value;
                property = triple.predicate.value;
            } else if (this.isRDFTypePredicate(triple.predicate.value)) {
                types.push(triple.object.value);
            }
        });
        externalStore.match(null, null, resourceNode).forEach((triple: any) => {
            if (this.resourceIncludes(triple.predicate.value, hierarchicalRelations)) {
                parentId = triple.subject.value;
                property = this.getInverseIncludes(triple.predicate.value, hierarchicalRelations);
            }
        });
        const resource = new Resource(null, resourceId, types, property, parentId, false, '');
        return resource;
    }

    isRDFTypePredicate(predicate: string) {
        return (predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
    }

    mapInternalExternalResources(externalStore: any, resourceRegistry: ResourceRegistry, relations: Array<string>) {
        const externalResourceMap: Array<InternalExternalMap> = [];
        relations.forEach(predicate => {
            const predicateNode = $rdf.sym(predicate);
            externalStore.match(null, predicateNode, null).forEach((triple: any) => {
                if (triple.subject.value in resourceRegistry) {
                    const map = this.mapInternalExternalResource(triple.subject.value, triple.object.value);
                    externalResourceMap.push(map);
                } else if (triple.object.value in resourceRegistry) {
                    const map = this.mapInternalExternalResource(triple.object.value, triple.subject.value);
                    externalResourceMap.push(map);
                }
            });
        });
        return externalResourceMap;
    }

    mapInternalExternalResource(internal: string, external: string) {
        const map: InternalExternalMap = {
            internal: internal,
            external: external
        }
        return map;
    }

    /*
    async loadVocabularies(vocabularyURL: string) {
        return null; //{url: }
    }
    */

    getAlternateLinkRefs(document: Document) {
        return this.getAlternateLinks(document).map(link => {
            const linkRef: LinkRef = {url: link.href, type: link.type}
            return linkRef;
        });
    }

    getAlternateLinks(document: Document) {
        return Array.from(document.getElementsByTagName("link")).filter(this.isAlternateLink);
    }

    isAlternateLink(element: HTMLElement) {
        if (element.tagName !== "LINK") {
            return false;
        } else if (!element.getAttribute("href") || !element.getAttribute("rel")) {
            return false;
        } else if (element.getAttribute("rel") !== "alternate") {
            return false;
        }
        return true;
    }
}
