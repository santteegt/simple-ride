import { CollectionObject } from './collection-object.model';

export interface Place extends CollectionObject {

	country_id: string;
	place_id: string;
	name: string;
	shortName: string;
	lat?: number;
	lng?: number;
	photoURL?: string;

}