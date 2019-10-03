import Annotation from './model/Annotation';

export default class Stan {

	constructor(public activeAnnotation? : Annotation) {
		this.activeAnnotation = activeAnnotation;
	}

}