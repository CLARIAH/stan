import Target from './model/Target';

//This class is the optional registry component that stores a list of targets for the optional UI component
//this allows the user to select a target via STAN, which should trigger an event that calls back the parent application, so
//it could highlight the selected target for the user
export default class TargetRegistry {

	constructor(public targetList: Array<Target>) {

	}
}