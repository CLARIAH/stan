
// RDFa/External resources are indexed to make target generation easy 
// as well as linking an RDFa target to the DOM.

export default class Resource {

	constructor(public node: Node | null, public id: string, public type: string | Array<string>, public parentRelation: any, public parent: any, public inDOM: Boolean, public text: string) {
		this.node = node;
        this.id = id;
		this.type = type;
		this.parentRelation = parentRelation;
        this.parent = parent;
        this.inDOM = inDOM;
        this.text = text;
	}

}

export class ResourceRegistry {

	constructor(public topLevelResources: Array<string>, public index: ResourceIndex) {
		this.topLevelResources = topLevelResources
		this.index = index
	}
}

export interface ResourceIndex {
	[resourceId: string]: Resource
}
