import { Meteor } from 'meteor/meteor';

import { UserPlaces } from '../../../both/collections/user-places.collection';


Meteor.publish('user-places', function(user_id?: string) {

  const selector = user_id ? {'user_id': user_id}: {};

  return UserPlaces.find(selector);
});
