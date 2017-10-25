import { CollectionObject } from './collection-object.model';
 
export interface PromoCode extends CollectionObject {

	promoType: string;
	code: string;
	description?: string;
	creationDate: Date;
	expirationDate: Date;
	active: boolean; // it MUST be deactivated for one use promos
	discountPercentage: number;

}

export class PROMOTYPES {
	static PIN: string = "pin";
}