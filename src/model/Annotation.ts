import Target from './Target';
import Body from './Body';

// These are the defined motivations in the Web Annotation Vocabulary
// Editing includes correcting?
// Describing includes transcribing?
export enum Motivation {
	ASSESSING    = 'assessing',
	BOOKMARKING  = 'bookmarking',
	CLASSIFYING  = 'classifying',
	COMMENTING   = 'commenting',
	DESCRIBING   = 'describing',
	EDITING      = 'editing',
	HIGHLIGHTING = 'highlighting',
	IDENTIFYING  = 'identifying',
	LINKING      = 'linking',
	MODERATING   = 'moderating',
	QUESTIONING  = 'questioning',
	REPLYING     = 'replying',
	TAGGING      = 'tagging'
}

const combineElements = (ele1: string | Array<string>, ele2: string | Array<string>) => {
	if (!Array.isArray(ele1)) {
		ele1 = [ele1]
	}
	if (!Array.isArray(ele2)) {
		ele2 = [ele2]
	}
	return ele1.concat(ele2);
}

export default class Annotation {
	public context: string | Array<string> = "http://www.w3.org/ns/anno.jsonld";
	public type: string | Array<string> = "Annotation";
	constructor(public target: Target | Array<Target>, public id?: string | null, public creator?: string, public created?: string,
		public motivation?: Motivation,	public body?: Body | Array<Body>, 
		public additionalContexts?: string | Array<string>, private additionalTypes?: string | Array<string>) {
			if (additionalContexts) {
				this.context = combineElements(this.context, additionalContexts);
			}
			if (additionalTypes) {
				this.type = combineElements(this.type, additionalTypes);
			}
		this.id = id;
		this.creator = creator;
		this.created = created;
		this.motivation = motivation;
		this.target = target;
		this.body = body;
	}
}

export enum Agent {
	PERSON = "Person",
	ORGANIZATION = "Organization",
	SOFTWARE = "Software"
}

export interface Creator {
	id?: string,
	type?: Agent,
	name?: string,
	nickname?: string,
	email?: string,
	email_sha1?: string,
	homepage?: string
}
