import { Meteor } from 'meteor/meteor';
import { Images } from '../../../both/collections/images.collection';

Meteor.publish('images', function(user_id?: string) {
	let selector = {};
	if(user_id) {
		selector['user_id'] = user_id;
	}
	return Images.collection.find(selector, {sort: {'uploadedAt': 1}});
});