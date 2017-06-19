import { CollectionObject } from './collection-object.model';

export interface UserTripFlag extends CollectionObject {

	user_id: string;
	isDriver: boolean;
	trip_id: string;
	active: boolean;
	departure_date: Date;
	code?: string; // only for users
	meeting_point?: GeoPoint;
	arrival_date?: Date;

}

interface GeoPoint {
	lat: number;
	lng: number;
}