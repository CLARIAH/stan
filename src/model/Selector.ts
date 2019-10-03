
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

	constructor(public context: string, public type: SelectorType, public value: any, public refinedBy: any) {
		this.context = context;
		this.type = type;
		this.value = value;
		this.refinedBy = refinedBy;
	}

}