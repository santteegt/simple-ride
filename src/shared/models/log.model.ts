import { CollectionObject } from './collection-object.model';

export interface Log extends CollectionObject {

	user_id: string;
	component: string;
	process: string;
	error: string;

}