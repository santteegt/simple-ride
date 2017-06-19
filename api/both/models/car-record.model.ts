import { CollectionObject } from './collection-object.model';
 
export interface CarRecord extends CollectionObject {

	driver_id: string;
	creationDate: Date;
	active: boolean;
	brand: string;
	color: string;
	model: string; //eg SAIL 5P 1.4L 4X2 TM STD
	class: string;
	year: string;
	register_year: string;
	register_date: string;
	service_type: string; //eg particular
	register_expiryDate: string;

}