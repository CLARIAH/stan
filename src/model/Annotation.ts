import Target from './Target';
import Body from './Body';

export default class Annotation {

	constructor(public id: string, public target?: Target, public body?: Body) {
		this.id = id;
		this.target = target;
		this.body = body;
	}
}