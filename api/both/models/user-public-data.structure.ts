import { Driver } from './user.model';

export interface UserData {
	user_id: string;
	forename: string;
	surname: string;
	age: number;
	gender: string;
	profileImg: string;
	conversation: string;
	driverData: Driver;
	rating?: number;
}
