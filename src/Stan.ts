import Annotation from './model/Annotation';
import TargetRegistry from './TargetRegistry';
import {AnnotationUtil, ObjectUtil, IDUtil, AnnotationEvent} from './util/annotation-util';

export default class Stan {

	public config : any;
	public events : any;
	public activeTarget : any; //set via setActiveTarget
	public activeAnnotation : any; //only one annotation is active
	public activeBody : any; //always null by default
	public activeSelection : any; //only one selection is active
	public annotations : Array<any> = [];
	public activeTemplate : any;
	static instance : Stan;

	//TODO add something for the target registry?
	constructor(config: any, events: any) { //this part of the constructor should be replaced
        if(!this.validateConfig(config)) {
            alert('error: Please provide a valid STAN-client config');
            return;
        }
        this.config = config;
        this.events = events;//new Events(); TODO fallback to new events object/function
        this.annotations = []; //filled when setActiveTarget is called (or setActiveProject)
        this.activeTemplate = config.templates[Object.keys(config.templates)[0]] //always just set the first template

        Stan.instance = this;
	}

    static singleton(config: any, events: any) {
        if(Stan.instance) {
            Stan.instance.config = config;
            Stan.instance.events = events;
            return Stan.instance;
        }
        return new Stan(config, events);
    }

    validateConfig = (config : any) => { //TODO extend this much more, for now it roughly checks if there is a template defined
        return config && config.templates && typeof config.templates === 'object';
    }

    setActiveTemplate = (templateId : string) => {
        this.activeTemplate = this.config.templates[templateId];
    }

    /* ------------------------- LOADING ANNOTATIONS OF ACTIVE TARGET (CHANGE TO STAN-SERVER) --------------------------------- */

    async refreshTargetAnnotations() {
        //TODO fetch all annotations based on an NPID
        //this.activeTarget.npid;
        if(!this.activeTarget) return [];
        let annotations : Array<object> = await this.__loadTargetAnnotations(this.activeTarget.npid, this.activeTarget.nonW3Cparams);
        if(this.activeTemplate.listTypes) {
            const additionalAnnotations : Array<object> = await this.__loadAnnotationsOfTypes(this.activeTemplate.listTypes);
            annotations = annotations.concat(additionalAnnotations);
        }
        return annotations;
    }

    async __loadAnnotationsOfTypes(types : Array<string>) : Promise<any> {
        let annotations : Array<object> = [];
        for(let i=0;i<types.length;i++) { //NOTE: forEach is not Promise aware, therefore a simple for-loop
            const temp : Array<object> = await this.__loadAnnotationsOfType(
                this.activeTarget.npid,
                types[i], //semanticType
                this.activeTarget.nonW3Cparams
            );
            annotations = annotations.concat(temp);
        }
        return new Promise(resolve => {
            resolve(annotations);
        })
    }

    //loads the annotations directly related to the active target (leaf node)
    async __loadTargetAnnotations (npid : any, nonW3Cparams : any = {}) : Promise<any> {
        let annotations : Array<object>;
        if(npid) {
            const leaf : any = npid[npid.length -1];
            annotations = await this.__loadFromAPI({
                'target.source': leaf.id //leave out the type, since it can be e.g. Segment / MediaObject
            }, nonW3Cparams)
        }
        return new Promise(resolve => {
            resolve(annotations);
        });
    }

    //loads annotations directly related to a certain part (indicated by the semanticType) of the npid
    async __loadAnnotationsOfType(npid : any, semanticType : string, nonW3Cparams : any = {}) : Promise<any> {
        let annotations : Array<object>;
        if(npid) {
            const pidOfType : any = npid.find((pid : any) => pid.type.indexOf(semanticType) != -1);
            annotations = pidOfType ? await this.__loadFromAPI({
                'target.source': pidOfType.id,
                'target.type' : semanticType
            }, nonW3Cparams) : null;
        }
        return new Promise(resolve => {
            resolve(annotations);
        });
    }

    __loadFromAPI = (filter : any, nonW3Cparams : any = {}) : Promise<any> => {
        return new Promise(resolve => {
            //add the non-null nonW3Cparams to the filter
            Object.assign(filter, ObjectUtil.filterNullValues(nonW3Cparams));

            //hack for now:
            filter['user.keyword'] = filter['user'];
            delete filter['user'];

            const notFilter : any = {
                motivation: 'bookmarking'
            };

            AnnotationAPI.getFilteredAnnotations(
                filter['user.keyword'], //user ID
                filter,
                notFilter,
                resolve
            );
        });
    };

    /* ------------------------- CRUD (REWIRE TO STAN) --------------------------------- */

	save = (setActive : boolean = true, notify : boolean = true) : Promise<any> => {
        return new Promise( (resolve : any) => {
        	if(!this.activeAnnotation) {
				alert('no active annotation, cannot save');
            	resolve(null);
        	}
            AnnotationAPI.saveAnnotation(this.activeAnnotation, (data : any) => {
                if(data == null) resolve(null);
                //assign the annotation data returned from the server (which now has annotation IDs)
                this.activeAnnotation = setActive ? data : null;

                //add or update the annotation in the list
                if(!this.annotations.find((a : any) => a.id === data.id)) {
                    this.annotations.push(ObjectUtil.clone(data));
                } else {
                    this.annotations[
                        this.annotations.findIndex((a : any) => a.id === data.id)
                    ] = ObjectUtil.clone(data);
                }

                if(notify) {
                    this.events.trigger(AnnotationEvent.ON_SAVE, ObjectUtil.clone(data)); // also trigger all listeners
                    //this.events.trigger(annotation.target.source, annotation); // TODO also trigger everyone listening to the media object
                }

                resolve(this.activeAnnotation); // callback for the async function
            });
        })
	};

    delete = (annotation : any, notify : boolean = true) : Promise<any> => {
        return new Promise(resolve => {
            AnnotationAPI.deleteAnnotation(annotation, (data : any, annotation : any) => {
                if(data == null) resolve(null);
                resolve(data);//,annotation

                this.annotations = this.annotations.filter((a : any) => a.id !== annotation.id);
                this.activeAnnotation = null;
                if(notify) {
                    this.events.trigger(AnnotationEvent.ON_DELETE, annotation);
                    //this.events.trigger(annotation.target.source, annotation);
                }
            });
        });
    };

    /* ------------------------ IMPORT CONVENIENCE METHODS FOR CRUD ON BODY ELEMENTS --------------------- */

    async saveBodyElement(bodyElement : any, setActive : boolean = true, notify : boolean = true) {
        if(!this.activeAnnotation || bodyElement == null) return;
        const body : any = this.activeAnnotation.body ? this.activeAnnotation.body : [];
        if(bodyElement.annotationId) { // update
            body[body.findIndex((b : any) => b.annotationId === bodyElement.annotationId)] = ObjectUtil.clone(bodyElement);
        } else { // add
            bodyElement.annotationId = IDUtil.guid(); // generate on the client, so we know how to track it
            body.push(ObjectUtil.clone(bodyElement));
        }
        this.activeAnnotation.body = body;
        this.activeAnnotation = await this.save(true, notify);
        this.activeBody = setActive ? ObjectUtil.clone(bodyElement) : null; // the newly saved body element becomes the active one or null

        //return the promise and trigger listeners if needed TODO merge with save as well
        return new Promise(resolve => {
            resolve({annotation: this.activeAnnotation, bodyElement: this.activeBody});

            if(notify) {
                this.events.trigger(
                    AnnotationEvent.ON_SET_ANNOTATION, {annotation : this.activeAnnotation, bodyElement: this.activeBody}
                );
            }
        });
    };

    async removeBodyElement(motivation : string, index : number, setActive : boolean = true, notify : boolean = true) {
        if(!this.activeAnnotation) return;
        const bodyElementsOfMotivation : Array<object> = this.activeAnnotation.body ?
            this.activeAnnotation.body.filter((b : any) => b.annotationType === motivation) :
            [];

        bodyElementsOfMotivation.splice(index, 1);
        this.activeAnnotation.body = this.activeAnnotation.body.filter(
            (b : any) => b.annotationType !== motivation
        ).concat(
            bodyElementsOfMotivation
        );
        this.activeAnnotation = await this.save(true, notify);

        const savedBodyElementsOfMotivation : Array<object> = this.activeAnnotation.body.filter(
        	(b : any) => b.annotationType === motivation
        )

        if(setActive) {
            this.activeBody = savedBodyElementsOfMotivation.length > 0 ?
                ObjectUtil.clone(savedBodyElementsOfMotivation[0]) :
                null
            ;
        } else {
            this.activeBody = null;
        }

        //return the promise and trigger listeners if needed TODO merge with save as well
        return new Promise(resolve => {
            resolve({annotation: this.activeAnnotation, bodyElement: this.activeBody});

            if(notify) {
                this.events.trigger(AnnotationEvent.ON_SET_ANNOTATION, {
                    annotation : this.activeAnnotation, bodyElement: this.activeBody
                });
            }
        });

    }

    /* ------------------------- SELECTING PARTS OF THE SCREEN TO UPDATE ANNOTATION TARGETS ---------- */

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

    //TODO rework so it works for text, spatial, temporal selections
    //use it to create an active refinedBy/selection object, that can be visualised by whoever can (see saveSelection())
    //TODO create a new event for notifying: ON_SET_SELECTION
    setActiveSelection = (selection : any, notify : boolean = true) => { //TODO merge with setActiveTarget, called by the TierView only
        this.activeSelection = ObjectUtil.clone(selection);
        if(selection) {
            this.activeSelection.semanticType = this.activeTemplate.selectionType; //always add the selectionType
        }
        this.events.trigger(AnnotationEvent.ON_SET_SELECTION, this.activeSelection);
    }

    // Saves an annotation based on the current selection.
    // if there is an active annotation, that means the selection updates the target of that annotation
    // always make sure to SET the selection before saving it, since this gives other components the chance to
    // respond to the ON_SET_SELECTION event triggered (see setActiveSelection)
    async saveSelection(setActive : boolean = true, notify : boolean = true) { //merge with save()
        if(!this.activeSelection) {
            alert('no active selection, cannot save');
            return;
        }

        if(this.activeAnnotation && this.activeAnnotation.target.selector.refinedBy) {//update the selection
            this.activeAnnotation.target.selector.refinedBy = AnnotationUtil.__generateRefinedBy(this.activeSelection);
        } else if(this.activeTarget) { //create new annotation with the selection
            this.activeAnnotation = this.newAnnotation();
        } else {
            alert('error: trying to save selection without an active target');
            return new Promise(resolve => {
                resolve(null);
            });
        }

        this.activeAnnotation = await this.save(setActive, notify);

        //return the promise and trigger listeners if needed TODO merge with save as well
        return new Promise(resolve => {
            const data : any = {annotation: this.activeAnnotation, segment: this.activeSelection}
            resolve(data);
        });
    }

    /* ------------------------- EDIT, PLAY, SET/ACTIVATE ANNOTATION --------------------------------- */

    edit = (annotation : any, bodyElement? : any, notify : boolean = true) => {
        this.__activateAndTrigger(AnnotationEvent.ON_EDIT, annotation, bodyElement, notify);
    }

    play = (annotation : any, bodyElement? : any, notify : boolean = true) => {
        this.__activateAndTrigger(AnnotationEvent.ON_PLAY, annotation, bodyElement, notify);
    }

    setActiveAnnotation = (annotation : any, bodyElement? : any, notify : boolean = true) => { // (currently) the can only be one active annotation
        this.__activateAndTrigger(AnnotationEvent.ON_SET_ANNOTATION, annotation, bodyElement, notify);
    };

    setActiveBodyElement = (bodyElement : any, notify : boolean = true) => { // activate a bodyElement within the active annotation
        this.__activateAndTrigger(AnnotationEvent.ON_SET_ANNOTATION, this.activeAnnotation, bodyElement, notify);
    };

    //all called by edit, play & setActiveAnnotation. The only difference is the event triggered
    __activateAndTrigger = (eventType : AnnotationEvent, annotation : any, bodyElement? : any, notify : boolean = true) => {
        this.activeAnnotation = ObjectUtil.clone(annotation);
        this.activeBody = ObjectUtil.clone(bodyElement);
        if (annotation && annotation.target) { //TODO simplify these functions as well
            //TODO this should not perse trigger a new ON_SET_SELECTION
            this.setActiveSelection(AnnotationUtil.extractSelectionFromTarget(annotation.target));
        }
        if(notify) {
            if(eventType != AnnotationEvent.ON_SET_ANNOTATION) {
                this.events.trigger(eventType, {
                    annotation : this.activeAnnotation, bodyElement: this.activeBody
                });
            }

            //for "edit" & "play" events also trigger the "set" listeners
            this.events.trigger(AnnotationEvent.ON_SET_ANNOTATION, {
                annotation : this.activeAnnotation, bodyElement: this.activeBody
            });
        }
    };

    /* ------------------------- CHANGE ANNOTATION TARGET --------------------------------- */

    /*
        TODO This function needs to be called whenever something is selected on the screen. This function
        then takes care of finding or creating the corresponding annotation.

        Concerning the parameters, either an annotation or a list of consecutive PID elements is supplied:
        [collectionId, resourceId, mediaObject, segment] TODO better think about passing this

        Most importantly: setting an active target ALWAYS results in (re)setting the active annotation.
        This way it is clear that changing/making a target on the screen OR selecting an existing annotation,
        results in the same thing: a new active annotation.

        The only difference (maybe) is that an existing annotation is already saved on the server.

    */
    //only called by the resourceviewer.jsx, so update there
    //TODO rename to loadAnnotationsForTarget()
    //TODO add the NPID template, ids & nonW3Cparams as params
    async setActiveTarget(ids : Array<string>, nonW3Cparams : any = {}, additionalTypes : Array<string> =[], notify : boolean = true) {
        this.activeTarget = {
            ids : ids,
            nonW3Cparams : nonW3Cparams,
            additionalTypes : additionalTypes, //remember these too (see saveSelection())
            npid : AnnotationUtil.constructNPID(this.activeTemplate, ids, false, additionalTypes)
        }
        this.activeAnnotation = null; //no active annotation when this is changed
        this.activeSelection = null; //nothing is selected when changing the active (annotatable) target
        this.annotations = await this.refreshTargetAnnotations(); //always uses this.activeTarget to refresh the annotations

        return new Promise(resolve => {
            resolve(this.activeTarget);
            if(notify) {
                this.events.trigger(AnnotationEvent.ON_CHANGE_TARGET, this.activeTarget);
            }
        });
    };

    //constructs a new annotation based on the active target, selection & a desired semantic type (if any)
    newAnnotation = (semanticType? : string, selection : boolean = true) => {
        const level : number = AnnotationUtil.getLevelOfSemanticType(this.activeTemplate.nestedPID, semanticType)
        if(level === -1 && semanticType) {
            alert('error: please supply a valid semantic type; ' + semanticType + ' is not part of the template');
            return null;
        }

        const selectionToUse : boolean = selection === true ? this.activeSelection : null;
        const idsToUse : Array<string> = semanticType ?
        	this.activeTarget.ids.slice(0, level + 1) :
        	this.activeTarget.ids;
        const additionalTypesToUse : Array<string> = semanticType ?
            level === (this.activeTarget.ids.length -1) ?
                this.activeTarget.additionalTypes :
                []
            : this.activeTarget.additionalTypes

        const annotation : any = AnnotationUtil.newAnnotationFromNPID(
            AnnotationUtil.constructNPID(
                this.activeTemplate,
                idsToUse,
                selectionToUse,//whether to use the active selection or not
                additionalTypesToUse //only use the additional type if it matches the level
            ),
            selectionToUse,
            this.activeTarget.nonW3Cparams
        );
        return annotation;
    }

}