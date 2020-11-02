import Selector from './Selector';

export default class Target {
	public id: string | null = null;
	public source: string | null = null;
	public scope: string | null = null;
	public selector: Selector | null = null;
	public type: string | Array<string> | null = null;

	constructor(id?: string, source?: string, selector?: Selector, scope?: string, type?: string) {
		if (id) 
			this.id = id
		if (source)
			this.source = source;
		if (selector)
			this.selector = selector;
		if (scope)
			this.scope = scope;
		if (type)
			this.type = type;
	}

	static construct = (data: any) => {
		data.id = (data.id) ? data.id : undefined;
		data.source = (data.source) ? data.source : undefined;
		data.scope = (data.scope) ? data.scope : undefined;
		data.selector = (data.selector) ? data.selector : undefined;
		data.type = (data.type) ? data.type : undefined;
		const target = new Target(data.id, data.source, data.selector, data.scope, data.type);
		return target;
	}

}
/*

export default interface Target {
	id?: string,
	source?: string,
	selector?: Selector,
	scope?: string,
	type?: string | Array<string>
}
*/