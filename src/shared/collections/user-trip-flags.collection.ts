// TODO:
// import { Meteor } from 'meteor-client';
import { MongoObservable } from 'meteor-rxjs';

import { UserTripFlag } from '../models/user-trip-flag.model';
 
export const UserTripFlags = new MongoObservable.Collection<UserTripFlag>('user_trip_flags');

function loggedIn() {
  return !!Meteor.user();
}
 
UserTripFlags.allow({
  insert: () => {return false;},
  update: () => {return false;},
  remove: () => {return false;}
});