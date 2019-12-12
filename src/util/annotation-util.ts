export enum AnnotationEvent {
    ON_SAVE = 'on-save-annotation',
    ON_DELETE = 'on-delete-annotation',
    ON_EDIT = 'on-edit-annotation',
    ON_PLAY = 'on-play-annotation',
    ON_SET_ANNOTATION = 'on-set-annotation',
    ON_SET_SELECTION = 'on-set-selection',
    ON_CHANGE_TARGET = 'on-change-target'
}

export class AnnotationUtil {

    static constructNPID = (
        npidTemplate : any,
        ids : Array<string>,
        selection : boolean = false,
        additionalTypes : Array<string> = []
        ) => {
        if(!npidTemplate) {
            alert('Error: you have to supply an NPID template before a NPID can be constructed');
            return null;
        }
        const template : any = ObjectUtil.clone(npidTemplate); //make sure to always create a new object to avoid weird behaviour

        //then grab the relevant part of the template
        const nestedPID : any = template.nestedPID.slice(0, ids.length).map((e : any ,i : number) => {
            return {
                id: ids[i], //assign the supplied id
                type: e.type,
                property: e.property
            }
        });

        //add the selection type
        if(selection && template.selectionType) {
            nestedPID[nestedPID.length -1].type.push(template.selectionType);
        }
        //add the additional types
        nestedPID[nestedPID.length -1].type.push(...additionalTypes);

        return nestedPID;
    }

    static newAnnotationFromNPID = (npid : any, selection : any, nonW3Cparams : any = {}) => {
        let target : any = {
            type : npid[npid.length -1].type[0], // always use the first type for the target.source
            source : npid[npid.length -1].id,
            selector : {
                type: 'NestedPIDSelector',
                value: npid
            }
        }

        //Then assign the selection bit as a refinedBy element
        const refinedBy : any = selection ? AnnotationUtil.__generateRefinedBy(selection) : null;
        if(refinedBy) {
            target.selector.refinedBy = refinedBy;
            target.type = selection.semanticType;
        }

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

    //almost as important as being able to extract & construct an NPID.
    //TODO model selections in a class
    //TODO think about multi-target annotations; is it likely there will be multiple targets with selections?
    static extractSelectionFromTarget = (target : any) => {
        //selections are ALWAYS inside the refinedBy part of the target's selector
        if(!target || !target.selector || !target.selector.refinedBy) return null;

        if(target.selector.refinedBy.start) {
            return {
                type : 'temporal',
                start : target.selector.refinedBy.start,
                end : target.selector.refinedBy.end
            }
        } else if(target.selector.refinedBy.rect) {
            return {
                type : 'spatial',
                rect : target.selector.refinedBy.rect
            }
        } //TODO add text selection bit
    };

    /* --------------------------- MISC HELPER FUNCTIONS --------------------------- */

    static getLevelOfSemanticType = (npidTemplate : any, semanticType? : string) => {
        return npidTemplate.findIndex((pid : any) => pid.type.indexOf(semanticType) !== -1);
    }

    static getNPIDLength = (annotation : any) => {
        return AnnotationUtil.hasNPID(annotation) ? annotation.target.selector.value.length : -1;
    }

    static hasNPID = (annotation : any) => annotation && annotation.target &&
        annotation.target.selector && annotation.target.selector.type === 'NestedPIDSelector';

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