
import Target from './Target';

//TODO later on for each enum a class, implementing the SelectorType interface, with specific properties could be created.
export enum SelectorType {
	NESTED_PID_SELECTOR = 'NestedPIDSelector', //custom defined for STAN!
	FRAGMENT_SELECTOR = 'FragmentSelector',
	TEXT_POS_SELECTOR = 'TextPositionSelector',
	TEXT_QUOTE_SELECTOR = 'TextQuoteSelector',
	DATA_POS_SELECTOR = 'DataPositionSelector',
	SVG_SELECTOR = 'SvgSelector'
	//TODO add all
}

export default class Selector {

	constructor(public context: string | null, public type: SelectorType, public value: any, public refinedBy: any, public scope: string | null) {
		this.context = context;
		this.type = type;
		this.value = value;
		this.refinedBy = refinedBy;
		this.scope = scope;
	}

}

export class NestedPIDSelector extends Selector {
	constructor(public context: string, public type: SelectorType, public value: Array<Target>, public refinedBy: any, public scope: string | null) {
		super(context, type, value, refinedBy, scope);
		this.context = context;
		this.type = type;
		this.value = value;
		this.refinedBy = refinedBy;
		this.scope = scope;
	}
}
export interface TextPositionSelector {
	type: string,
	start: Number,
	end: Number
}
export interface TextQuoteSelector {
	type: string,
	exact: string,
	prefix: string,
	suffix: string
}
