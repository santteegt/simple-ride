import { CollectionObject } from './collection-object.model';

export interface Campaing extends CollectionObject {
	title: string;
	message: string;
	audience: string;
	total_sent: number;
	active: boolean;
}
