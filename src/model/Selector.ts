
//TODO later on for each enum a class, implementing the SelectorType interface, with specific properties could be created.
export enum SelectorType {
	NESTED_PID_SELECTOR = 'NestedPIDSelector', //custom defined for STAN!
	FRAGMENT_SELECTOR = 'FragmentSelector',
	XPATH_SELECTOR = "XPathSelector",
	TEXT_POS_SELECTOR = 'TextPositionSelector',
	TEXT_QUOTE_SELECTOR = 'TextQuoteSelector',
	DATA_POS_SELECTOR = 'DataPositionSelector',
	SVG_SELECTOR = 'SvgSelector'
	//TODO add all
}

export const makeSelector = (selectorType: SelectorType, data: any): Selector => {
	if (selectorType === SelectorType.XPATH_SELECTOR) {
		return new XPathSelector(data.value);
	} else if (selectorType === SelectorType.FRAGMENT_SELECTOR) {
		return new FragmentSelector(data.value, data.conformsTo);
	} else if (selectorType === SelectorType.NESTED_PID_SELECTOR) {
		return new NestedPIDSelector(data.value);
	} else if (selectorType === SelectorType.TEXT_QUOTE_SELECTOR) {
		return new TextQuoteSelector(data.exact, data.prefix, data.suffix);
	} else if (selectorType === SelectorType.TEXT_POS_SELECTOR) {
		return new TextPositionSelector(data.start, data.end);
	} else {
		throw Error('Invalid SelectorType');
	}
}

export default class Selector {

	constructor(public type: SelectorType, public refinedBy?: any) {
		this.type = type;
		this.refinedBy = refinedBy;
	}
}

export class NestedPIDElement {
	constructor(public id: string, public type: string | Array<string>, public property: string | null) {
		this.id = id;
		this.type = type;
		this.property = property;
	}

	static isNestedPIDElement (element: NestedPIDElement): boolean {
		if (typeof(element) !== 'object') {
			return false;
		} else if (!element.hasOwnProperty('type')) {
			return false;
		} else if (!element.hasOwnProperty('id')) {
			return false;
		} else if (!element.hasOwnProperty('property')) {
			return false;
		} else {
			return true;
		}
	}
}

export class NestedPIDSelector extends Selector {
	public context: string = "https://annotation.clariah.nl/vocabularies/swao.jsonld";
	constructor(public value: Array<NestedPIDElement>, public refinedBy?: Selector) {
		super(SelectorType.NESTED_PID_SELECTOR, refinedBy);
		if (!Array.isArray(value) || value.length === 0) {
			throw Error('for NestedPIDSelector value should be a Array with at least one NestedPIDElement')
		} else if (!value.every(element => { return NestedPIDElement.isNestedPIDElement(element)})) {
			throw Error('All elements of value array should be of type NestedPIDElement')
		}
		this.value = value;
	}
}

export class FragmentSelector extends Selector {
	constructor(public value: string, public conformsTo: string) {
		super(SelectorType.FRAGMENT_SELECTOR);
		this.value = value;
		this.conformsTo = conformsTo;
	}
}

export class XPathSelector extends Selector {
	constructor(public value: string) {
		super(SelectorType.XPATH_SELECTOR);
		this.value = value;
	}
}

export class TextPositionSelector extends Selector {
	constructor(public start: Number, public end: Number) {
		super(SelectorType.TEXT_POS_SELECTOR);
		if (start < 0) {
			throw Error('start position cannot be negative')
		} else if (end < start) {
			throw Error('end position cannot be before start')
		}
		this.start = start;
		this.end = end;
	}
}

export class TextQuoteSelector extends Selector {
	constructor(public exact: string, public prefix: string, public suffix: string) {
		super(SelectorType.TEXT_QUOTE_SELECTOR);
		this.exact = exact;
		this.prefix = prefix;
		this.suffix = suffix;
	}
}

