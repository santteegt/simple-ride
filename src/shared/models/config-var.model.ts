import { CollectionObject } from './collection-object.model';

export interface ConfigVar extends CollectionObject {

	name: string;
	value: string;
	creation_date: Date;
	active: boolean;

}

export class CONFIG_VARS {
	static ANT_URL: string = "ant_url";
}
