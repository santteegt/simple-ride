import { Meteor } from 'meteor/meteor';

import { UserTripFlags } from '../../../both/collections/user-trip-flags.collection';
 
Meteor.publish('trip-flags', function() {

	return UserTripFlags.find({active: true});
})