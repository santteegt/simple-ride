import { MongoObservable } from 'meteor-rxjs';
// TODO:
// import { Meteor } from 'meteor-client';

import { Trip } from '../models/trip.model';
 
export const Trips = new MongoObservable.Collection<Trip>('trips');

function loggedIn() {
  return !!Meteor.user();
}

 
Trips.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});

// Trips.collection['before'].insert(function (userId, doc) {
//   console.log('entra');
// });