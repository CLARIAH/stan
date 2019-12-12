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

/*
export default class Annotation {

	constructor(public context: string, public id: string | null, private type: string, public creator: string, public created?: Date,
		public motivation?: Motivation,	public target?: Target, public body?: Body) {
		this.context = context;
		this.id = id;
		this.type = type;
		this.creator = creator;
		this.created = created;
		this.target = target;
		this.body = body;
	}
}
*/

export default interface Annotation {
	context: string;
	id: string | null,
	type: Array<string> | string,
	creator: string | Creator,
	created?: string,
	target: string | Array<Target> | Target,
	body?: string | Array<Body> | Body
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
