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

export default class Annotation {

	constructor(public context: string, public id: string, private type: string, public creator: string, public created: Date,
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