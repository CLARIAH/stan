
// RDFa/External resources are indexed to make target generation easy 
// as well as linking an RDFa target to the DOM.

export default class Resource {

	constructor(public node: Node | null, public id: string, public type: String | Array<String>, public parentRelation: any, public parent: any, public inDOM: Boolean, public text: string) {
		this.node = node;
        this.id = id;
		this.type = type;
		this.parentRelation = parentRelation;
        this.parent = parent;
        this.inDOM = inDOM;
        this.text = text;
	}

}

export interface ResourceRegistry {
	[resourceId: string]: Resource
}
