// TODO:
// import { Meteor } from "meteor-client";
declare var Meteor;

import { User, USER_STATUS, DRIVER_STATUS, Person, Driver  } from "../shared/models";
import { Users } from "../shared/collections";

export class UserRegistration {

	protected user: User;
	protected person: Person;
	protected driverData: Driver;

	protected isDriver: boolean;
	
	constructor() {
		// this.user = Users.findOne({_id: Meteor.userId()});
		this.person = Meteor.user()["personData"];
		this.driverData = Meteor.user()["driverData"];

	}

	registerUser(update: boolean) {
		this.person.status = !update ? USER_STATUS.UNVERIFIED_MAIL:this.person.status;
		let modifier = {'personData': this.person}
		if(this.isDriver && !update) {
			modifier['driverData'] = {status: DRIVER_STATUS.NEW};
		}
		Meteor.users.update({_id: Meteor.userId()}, {$set: modifier});
		return true;
	}

	registerCar() {
		this.driverData.status = DRIVER_STATUS.UNVERIFIED_LICENSE;
		Meteor.users.update({_id: Meteor.userId()}, {$set: {'driverData': this.driverData}});
		return true;
	}
}