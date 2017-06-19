import { CollectionObject } from './collection-object.model';
 
export interface ChatMessage extends CollectionObject {

	trip_id: string;
	user_id: string;
	user_forename: string;
	user_surname: string;
	user_profileImg: string;
	is_driver: boolean;
	message_type: string;
	message_date: Date;
	message_time: string;
	message: string;

}

export class MESSAGETYPES {
	static SYSTEM: string = "system";
	static USER: string = "user";
}