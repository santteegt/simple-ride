import { CollectionObject } from './collection-object.model';

export interface Notification extends CollectionObject {
	user_id?: string; // null ONLY IF notification is sent to all users
	sent_date: Date;
	push_body: NotificationBody;
	read: boolean;
	archived?: boolean;
	redirect_component?: string;
	redirect_params?: any;
	from_user?: string; // null ONLY IF notification is sent to all users
	trip_id?: string; // null ONLY IF notification is sent to all users
	
}

export interface NotificationBody {
  title: string;
  text: string;
  from: string;
  badge: number;
  query: {
  	userId?: string;
  };
}