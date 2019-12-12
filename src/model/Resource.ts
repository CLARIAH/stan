
// RDFa/External resources are indexed to make target generation easy 
// as well as linking an RDFa target to the DOM.

export default class Resource {

	constructor(public node: Node | null, public id: string, public rdfType: String | Array<String>, public rdfProperty: any, public rdfaParent: any, public inDOM: Boolean, public text: string) {
		this.node = node;
        this.id = id;
		this.rdfType = rdfType;
		this.rdfProperty = rdfProperty;
        this.rdfaParent = rdfaParent;
        this.inDOM = inDOM;
        this.text = text;
	}

}

export interface ResourceRegistry {
	[resourceId: string]: Resource
}
