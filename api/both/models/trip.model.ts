import { CollectionObject } from './collection-object.model';

export interface Trip extends CollectionObject {
	driver_id: string;
	creationDate: Date;
	country_id: string;
	origin: Place;
	destination: Place;
	departureDate: Date;
	departureTime: string;
	departureAddress: string;
	price: number;
	places: number;
	distance: number;
	estimatedTime: number;
	available_places: number;
	options: TripOptions;
	rsvp_method: string;
	comments?: string;
	cancellation_date?: Date;
	cancellation_reason?: number;
}

interface Place {
	place_id: string;
	name: string;
	shortName: string;
}

interface TripOptions {
	handBaggage: boolean;
	baggage: boolean;
	pets: boolean;
	smoking: boolean;
	food: boolean;
  children: boolean;
}

export class RSVPMethod {
	static options = [
		'Automático',
		'Manual'
	];
}

export class DELETIONREASONS {
	static reasons = [
		'He decidido no viajar',
		'Problemas mecánicos'
	]
}
