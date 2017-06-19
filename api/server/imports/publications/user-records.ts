import { Meteor } from 'meteor/meteor';

import { UserRecords } from '../../../both/collections/user-records.collection';
 
Meteor.publish('user-record', function(user_id?: string, historic?: boolean) {

	let selector = { 'user_id': user_id ? user_id:this.userId };
	if(!historic) {
		selector['active'] = true;
	}

	return UserRecords.find(selector, {sort: {creationDate: 1}});
})