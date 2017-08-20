import { Meteor } from 'meteor/meteor';


export interface User extends Meteor.User {
// export interface User extends CollectionObject {
	// personData: Person;
	// driverData: Driver;

}

export interface Person {
	typeid: string;
	dni: string;
	forename: string;
	surname: string;
	birthday: Date;
	country: string;
	state: string;
	city: string;
	email: string;
	phone: string;
	gender: string;
	status: string;
	profileImg: string;
  conversation: string;
	isDriver: boolean;
	locale?: string;
	policeRecord?: boolean;
}

export interface Driver {
	carBrand: string;
	carColor: string;
	carRegister: string;
	noDoors?: number;
	status: string;
  hasInsurance: boolean;
}

export interface PaymentInfo {
	bankname: string;
	accounttype: string;
	accountname: string;
	accountnumber: string;
}

export interface Admin {
	isAdmin: boolean;
}

export class CONVERSATIONSTYLES {
	static styles = [
		{name: "quiet", value: 'Soy callado'},
		{name: "sometimes", value: 'Depende del tema'},
		{name: "talker", value: 'Me gusta hablar'}
	]
}
