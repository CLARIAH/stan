export enum Purpose {
	CLASSIFYING = 'classifying',
	LINKING = 'linking',
	COMMENTING = 'commenting',
	TAGGING = 'tagging',
	CORRECTING = 'correcting'
}

export default class Body {

	constructor(public type: string, public purpose: Purpose, public format: string, public value: any) {
		this.type = type;
		this.purpose = purpose;
		this.format = format;
		this.value = value;
	}
}