import Target from './Target';
import Body from './Body';

//TODO what are the possible motivations?
export enum Motivation {
	BOOKMARKING = 'bookmarking'
}

export default class Annotation {

	constructor(public context: string, public id: string, private type: string, public creator: string, public created: Date,
		public motivation?: Motivation,	public target?: Target, public body?: Body) {
		this.id = id;
		this.target = target;
		this.body = body;
	}
}