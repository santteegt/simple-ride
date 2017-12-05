import { CollectionObject } from './collection-object.model';

export interface CampaingLog extends CollectionObject {
	campaing_id: string;
	user_id: string;
	sent_date: Date;
}
