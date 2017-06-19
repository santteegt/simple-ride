import { CollectionObject } from './collection-object.model';

export interface UserRideMonitor extends CollectionObject {

	user_id: string;
	isDriver: boolean;
	trip_id: string;
	timestamp: Date;
	error: boolean;
	errorMsg?: string;
	geolocation?: GLocation; 
	activity?: Activity;
}

export interface GLocation {
	latitude: number;
	longitude: number;
	heading: number;
	speed: number;
	accuracy: number;
	timestamp: number;
	altitude: number;
}

export interface Activity {
	unkown: number;
	in_vehicle: number;
	still: number;
	walking: number;
	running: number;
	on_bicycle: number;
}