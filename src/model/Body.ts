export default class Body {

	constructor(public type: string, public purpose: string, public format: string, public value: any) {
		this.type = type;
		this.purpose = purpose;
		this.format = format;
		this.value = value;
	}
}