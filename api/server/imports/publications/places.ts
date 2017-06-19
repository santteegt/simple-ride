import { Meteor } from 'meteor/meteor';

import { Places } from '../../../both/collections/places.collection';
 
 
Meteor.publish('places', function(place_id?: string) {

  const selector = place_id ? {'place_id': place_id}: {};
 
  return Places.find(selector);
});