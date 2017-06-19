import { Meteor } from 'meteor/meteor';
import { MongoObservable } from 'meteor-rxjs';

import { Place } from '../models/place.model';
 
export const Places = new MongoObservable.Collection<Place>('places');

function loggedIn() {
  return !!Meteor.user();
}
 
Places.allow({
  insert: loggedIn,
  update: () => {return false;},
  remove: () => {return false;}
});