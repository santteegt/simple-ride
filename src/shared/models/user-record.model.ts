import { CollectionObject } from './collection-object.model';
 
export interface UserRecord extends CollectionObject {

	user_id: string;
	query_date: Date,
	active: boolean,

	is_passport: boolean;
	person_id: string;
	name: string;
	antecedent: boolean;
	seclusion: boolean;
	idr: string;

}