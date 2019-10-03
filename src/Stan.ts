import Annotation from './model/Annotation';
import TargetRegistry from './TargetRegistry';

export default class Stan {

	constructor(public activeAnnotation? : Annotation, public targetRegistry?: TargetRegistry) {
		this.activeAnnotation = activeAnnotation;
		this.targetRegistry = targetRegistry;
	}

	//this makes sure the active annotation is changed; note: all calls to the server work with the active annotation
	set activeAnnotation() {
		//TODO make sure to update the UI (if any)
	}

	save = () => {
		//TODO saves the active annotation to the server
	}

	delete = () => {
		//TODO deletes the active annotation on the server
	}

}