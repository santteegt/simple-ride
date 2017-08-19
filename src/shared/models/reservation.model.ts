import { CollectionObject } from './collection-object.model';

export interface Reservation extends CollectionObject {

	trip_id: string;
	driver_id: string;
	user_id: string;
	reservation_date: Date;
	departure_date: Date;
	places: number;
	comments: string;
	payment_method: string;
	payment_reference_id?: string; // e.g. scan_id of deposit, card reference, etc
	payment_status: string;
	payment_comments?: string;
	total: number;
	user_rating?: number; // given by user
	user_rating_comments?: string;
	driver_rating?: number; // given by driver
	driver_rating_comments?: string;
	cancellation_date?: Date;
	cancellation_reason?: number;
  origin: string;
  destination: string;
}

export class RESERVATIONSTATUS {
	static WAITING_USER_ACTION: string = "waiting_user_action";
	static WAITING_DRIVER_CONFIRMATION: string = "waiting_driver_confirmation";
	static PROCESSING_PAYMENT: string = "processing_payment";
	static PROCESSED: string = "processed";
}

export class CANCELLATIONREASONS {
	static reasons = [
		{id: 0, reason: 'He decidido no viajar', show: true},
		{id: 1, reason: 'Reserva Cancelada por el conductor', show: false},
		{id: 2, reason: 'Viaje Cancelado por el conductor', show: false}
	]
}
