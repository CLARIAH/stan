import Selector from './Selector';

/*
export default class Target {

	constructor(public source: string, public selector: Selector, public scope: string, public type: string) {
		this.source = source;
		this.selector = selector;
		this.scope = scope;
		this.type = type;
	}

}
*/

export default interface Target {
	id?: string,
	source?: string,
	selector?: Selector,
	scope?: string,
	type: string
}