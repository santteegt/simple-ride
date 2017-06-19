import { Meteor } from 'meteor/meteor';

import { CarRecords } from '../../../both/collections/car-records.collection';
 
Meteor.publish('car-record', function(user_id: string, historic?: boolean) {
	let selector = { driver_id: user_id ? user_id:this.userId };
	if(!historic) {
		selector['active'] = true;
	}

	return CarRecords.find(selector, {sort: {creationDate: 1}});
})