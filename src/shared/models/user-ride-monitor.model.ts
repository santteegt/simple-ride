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
	locationId: number;
	serviceProvider: string;
	debug: boolean;
	time: number;
	latitude: number;
	longitude: number;
	accuracy: number;
	speed: number;
	timestamp: number;
	altitude: number;
	altitudeAccuracy: number;
	bearing: number;
	coords: any;
}

export interface Activity {
	unkown: number;
	in_vehicle: number;
	still: number;
	walking: number;
	running: number;
	on_bicycle: number;
}