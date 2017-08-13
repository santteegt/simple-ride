import { CollectionObject } from './collection-object.model';

export interface UserPlace extends CollectionObject {

	user_id: string;
	place_id: string;
	name: string;
	description: string;
}
