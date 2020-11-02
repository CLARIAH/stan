import { Motivation } from "../model/Annotation";
import Annotation from "../model/Annotation";
import Target from '../model/Target';
import Selector, { makeSelector, NestedPIDElement, NestedPIDSelector, SelectorType } from "../model/Selector";
import RDFaUtil from "../util/extract-rdfa-util";
import SelectionUtil, { MouseSelection, TextSelection } from "../util/extract-selection-util";
import { ClientConfig } from "../model/ClientConfig";
import Resource, { ResourceRegistry } from "../model/Resource";
import TargetRegistry from "../TargetRegistry";
import DOMUtil from "./extract-dom-util";

const util = {
    dom: new DOMUtil(),
    rdfa: new RDFaUtil(),
    selection: new SelectionUtil()
}
export enum AnnotationEvent {
    ON_SAVE = 'on-save-annotation',
    ON_DELETE = 'on-delete-annotation',
    ON_EDIT = 'on-edit-annotation',
    ON_PLAY = 'on-play-annotation',
    ON_SET_ANNOTATION = 'on-set-annotation',
    ON_SET_SELECTION = 'on-set-selection',
    ON_CHANGE_TARGET = 'on-change-target'
}

export default class AnnotationUtil {

    constructor(public config: ClientConfig, public resourceRegistry: ResourceRegistry | null) {
        this.config = config;
        this.resourceRegistry = resourceRegistry;
    }

    static listMotivations = () => {
        const motivations: String[] = Object.values(Motivation);
        return motivations;
    }

    static makeTargetTextSelection = (selection: MouseSelection, useRDFaIdentifiers: boolean = false): Selector => {
        // transform selection object into text selection with offsets inside selection container node
        const textSelection = util.selection.makeTextSelection(selection);
        // set start and end positions for selector
        const position = {start: textSelection.containerStartOffset, end: textSelection.containerEndOffset}
        if (useRDFaIdentifiers) {
            // if using RDFa resources, find lowest container resources
            const rdfaContainer = util.rdfa.getRDFaContainer(textSelection.containerNode);
            if (rdfaContainer) {
                // recalculcate text offsets w.r.t. rdfaContainer
                const containerOffset = util.selection.findNodeOffsetInContainer(textSelection.containerNode, rdfaContainer)
                position.start += containerOffset;
                position.end += containerOffset
            }
        }
        // generate text position selector
        const selector = makeSelector(SelectorType.TEXT_POS_SELECTOR, position)
        return selector;
    }

    static makeTargetFromId = (targetId: string): Target => {
        // use a target ID (e.g. a URL) as target
        let target = Target.construct({});
        target.id = targetId;
        return target;
    }

    public makeRDFaTargetWithTextSelection = (selection: MouseSelection, resourceRegistry: ResourceRegistry): Target => {
        let target = Target.construct({});
        const selector = AnnotationUtil.makeTargetTextSelection(selection, true);
        const textSelection = util.selection.makeTextSelection(selection);
        const rdfaContainer = util.rdfa.getRDFaContainer(textSelection.containerNode);
        const rdfaResource = util.rdfa.getRDFaResourceAttribute(<HTMLElement>rdfaContainer);
        if (this.config.useNestedPIDSelector) {
            // use RDFa container resource and its RDFa oaretnas target source
            const nestedPID = this.constructNPID(rdfaResource);
            target.source = nestedPID[0].id;
            target.selector = makeSelector(SelectorType.NESTED_PID_SELECTOR, {value: nestedPID});
            target.selector.refinedBy = selector;
        } else {
            // use RDFa container resource as target source
            target.source = rdfaResource;
            target.selector = selector;
        }
        target.type = "Text"
        return target
    }

    public makeRDFaTarget = (resourceRegistry: ResourceRegistry): Target | Array<Target> => {
        let selection = util.selection.getDOMSelection();
        let self = this;
        // there has to be a registry of RDFa resource to make an RDFa target
        if (selection) {
            // if the user selected something in the DOM, use that as a selector and
            // the RDFa resource that it's part of as target
            return this.makeRDFaTargetWithTextSelection(selection, resourceRegistry);
        } else {
            // if there is no selection, all top-level RDFa resources are targets
            const targets = resourceRegistry.topLevelResources.map(resourceId => {
                const nestedPID = self.constructNPID(resourceId)
                let target = Target.construct({});
                if (self.config.useNestedPIDSelector) {
                    // make a NestedPIDSelector
                    target.source = resourceId
                    target.selector = makeSelector(SelectorType.NESTED_PID_SELECTOR, {value: nestedPID})
                } else {
                    target.id = resourceId;
                }
                target.type = "Text"
                return target;
            })
            // if there is only a single top-level RDFa resource, return it as a single target
            // otherwise return as Array of targets
            return (resourceRegistry.topLevelResources.length > 1) ? targets : targets[0];
        }
    }

    public makeWindowTarget = (): Target => {
        let selection = util.selection.getDOMSelection();
        if (selection) {
            // if something is selected, make an XPathSelector and refine it by
            // a TextPositionSelector
            const textSelection = util.selection.makeTextSelection(selection);
            const xpath = util.dom.getElementXpath(<HTMLElement>textSelection.containerNode);
            const selector = makeSelector(SelectorType.XPATH_SELECTOR, {value: xpath});
            const position = {start: textSelection.containerStartOffset, end: textSelection.containerEndOffset}
            selector.refinedBy = makeSelector(SelectorType.TEXT_POS_SELECTOR, position)
            const target = Target.construct({
                source: window.location.href,
                selector: selector,
                type: "Text"
            });
            return target;
        } else {
            // use window URL as target
            return AnnotationUtil.makeTargetFromId(window.location.href);
        }

    }

    public makeTarget = (): Target | Array<Target> => {
        if (this.config.useRDFaIdentifiers) {
            if (!this.resourceRegistry) {
                throw Error('Cannot make RDFa target, annotationUtil has no ResourceRegistry.')
            } else {
                return this.makeRDFaTarget(this.resourceRegistry);
            }
        } else {
            return this.makeWindowTarget();
        }
    }

    public makeTargetFromRegistry = (resourceId: string, selector?: Selector): Target => {
        let target = Target.construct({});
        if (!this.resourceRegistry) {
                throw Error('Cannot make RDFa target, annotationUtil has no ResourceRegistry.')
        } else if (!this.resourceRegistry.index.hasOwnProperty(resourceId)) {
            throw Error('resourceId is not in resourceRegistry');
        } else {
            if (this.config.useNestedPIDSelector) {
                const nestedPID = this.constructNPID(resourceId);
                console.log(nestedPID);
                target.source = resourceId
                target.selector = makeSelector(SelectorType.NESTED_PID_SELECTOR, nestedPID);
                target.type = this.resourceRegistry.index[resourceId].type
                if (selector) {
                    target.selector.refinedBy = selector;
                }
            } else {
                target.id = resourceId
                target.type = this.resourceRegistry.index[resourceId].type
                if (selector) {
                    target.selector = selector;
                }
            }
        }
        return target;
    }

    static constructNPIDElement = (resource: Resource) => {
        let nestedPIDElement: NestedPIDElement = {
            id: resource.id,
            type: resource.type,
            property: resource.parentRelation
        }
        return nestedPIDElement;
    }

    public constructNPID = (resourceId : string) => {
        if(!this.resourceRegistry) {
            throw Error('Error: you have to supply an NPID template before a NPID can be constructed');
        } else if (!this.resourceRegistry.index.hasOwnProperty(resourceId)) {
            throw Error('id not in registry:' + resourceId)
        }
        let resource = this.resourceRegistry.index[resourceId];
        let nestedPIDElement = AnnotationUtil.constructNPIDElement(resource);
        const nestedPID: Array<NestedPIDElement> = [nestedPIDElement];
        while (resource.parent !== null) {
            resourceId = resource.parent;
            resource = this.resourceRegistry.index[resourceId];
            let nestedPIDElement = AnnotationUtil.constructNPIDElement(resource);
            nestedPID.push(nestedPIDElement);
        }
        return nestedPID;
    }

    static newAnnotationFromNPID = (npid : Array<NestedPIDElement>, selection : Selector | null, nonW3Cparams : any = {}) => {
        let target : any = {
            type : npid[npid.length -1].type[0], // always use the first type for the target.source
            source : npid[npid.length -1].id,
            selector : {
                type: 'NestedPIDSelector',
                value: npid
            }
        }

        //Then assign the selection bit as a refinedBy element
        /* 
        const refinedBy : any = selection ? AnnotationUtil.__generateRefinedBy(selection) : null;
        if(refinedBy) {
            target.selector.refinedBy = refinedBy;
            target.type = selection.semanticType;
        }
        */

        //finally return the generated annotation
        return Object.assign({
            id : null, //generated on the server
            body : null,
            target : target
        }, nonW3Cparams); //merge the custom params
    }

    /*
    temporal segment looks like:

        {start: start, end: end}

    spatial segment looks like:

        {
            rect : {
                x : rect.x,
                y : rect.y,
                w : rect.width,
                h : rect.height
            },
            rotation : rect.rotation
        }
    */

    /*
    static __generateRefinedBy = (selection : any) => {
        if(!selection) return null;

        if(selection.rect && typeof(selection.rect) == 'object') { //spatial
            return {
                type: "FragmentSelector",
                conformsTo: "http://www.w3.org/TR/media-frags/",
                value: '#xywh=' + selection.rect.x + ',' + selection.rect.y + ',' + selection.rect.w + ',' + selection.rect.h,
                rect : selection.rect //TODO remove custom MS prop
            }
        } else if(selection.start && selection.end && selection.start != -1 && selection.end != -1) { //temporal
            return {
                type: "FragmentSelector",
                conformsTo: "http://www.w3.org/TR/media-frags/",
                value: '#t=' + selection.start + ',' + selection.end,
                start: selection.start, //TODO remove custom MS prop
                end: selection.end //TODO remove custom MS prop
            }
        }
        return null;
    };
    */

    //almost as important as being able to extract & construct an NPID.
    //TODO model selections in a class
    //TODO think about multi-target annotations; is it likely there will be multiple targets with selections?
    static extractSelectionFromTarget = (target : Target) => {
        //selections are ALWAYS inside the refinedBy part of the target's selector
        if (!target || !target.selector) {
            return null;
        } else if (!target.selector.refinedBy) {
            return target.selector;
        } else {
            return target.selector.refinedBy;
        }
    };

    // get list of targets from an annotation, even if there is only one target
    static extractTargets = (annotation: Annotation) => {
        if (Array.isArray(annotation.target)) {
            return annotation.target;
        } else {
            const targetList: Array<Target> = [];
            targetList.push(annotation.target);
            return targetList;
        }
    }

    // get list of target IDs from an annotation, even if there is only one target ID
    static extractTargetIds = (annotation: Annotation) => {
        return AnnotationUtil.extractTargets(annotation).map(target => {
            return (typeof(target) === "string") ? target : AnnotationUtil.extractTargetId(target);
        })
    }

    // get target ID from a target
    static extractTargetId = (target: Target) => {
        // A target object should have an id property or a source property (if there is a selector)
        if (target.source) {
            return target.source;
        } else if (target.id) {
            return target.id;
        } else {
            throw Error("Error: target object MUST have either an id or a source property");
        }
    }

    // NestedPIDSelectors have multiple target IDs
    // Use this function to get the IDs if you know the target has a NestedPIDSelector
    static extractNestedPIDTargetIds = (target: Target) => {
        // if there is a nested PID selector, return its list of IDs
        if (!target.selector || !(target.selector instanceof NestedPIDSelector)) {
            throw Error("Error: target has no NestedPIDSelector")
        } 
        return target.selector.value.map(nestedTarget => {
            return nestedTarget.id;
        });
    }

    /* --------------------------- MISC HELPER FUNCTIONS --------------------------- */

    static hasNPID = (target : Target) => target.selector && target.selector instanceof NestedPIDSelector;

}

export class ObjectUtil {

    static clone = (object : any) => {
        return object == null ? null : JSON.parse(JSON.stringify(object));
    }

    static filterNullValues = (object : any) => {
        return Object.keys(object).filter(key => object[key] != null).reduce(
            (obj : any, key : string) => {
                obj[key] = object[key];
                return obj;
            }, {}
        );
    }
}

export class IDUtil {

    //used to generate a more compact form for unique strings (e.g. collection names) to be used as guid
    static hashCode = (s : string) => {
        let hash = 0, i, chr, len;
        if (s.length === 0) return hash;
        for (i = 0, len = s.length; i < len; i++) {
            chr   = s.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };

    //generates a guid from nothing
    static guid = () => {
        return IDUtil.__s4() + IDUtil.__s4() + '-' + IDUtil.__s4() + '-' +
        IDUtil.__s4() + '-' + IDUtil.__s4() + '-' + IDUtil.__s4() +
        IDUtil.__s4() + IDUtil.__s4();
    };

    //only used by the guid function
    static __s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };

}