import { CollectionObject } from './collection-object.model';

export interface AppActivityLog extends CollectionObject {

	user_id: string;
	activity: string;
	timelog: Date;

}

export class ACTIVITIES {
	static APPOPENED: string = "user_open_app";
}