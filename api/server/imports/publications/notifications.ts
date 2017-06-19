import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Notifications } from '../../../both/collections/notifications.collection';
 
interface Options {
  [key: string]: any;
}
 
Meteor.publish('notifications', function(user_id: string) {

	Counts.publish(this, 'notificationsCount', 
  			Notifications.collection.find({user_id: user_id, read: false}), {noReady: true});
 
  	return Notifications.find({user_id: user_id, archived: {$ne: true}}, {sort: {sent_date: -1}});
});