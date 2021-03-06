import { MongoObservable } from 'meteor-rxjs';
// TODO:
// import { Meteor } from 'meteor-client';

import { Reservation } from '../models/reservation.model';
 
export const Reservations = new MongoObservable.Collection<Reservation>('reservations');

function loggedIn() {
  return !!Meteor.user();
}

 
Reservations.allow({
  insert: () => {return false;},
  update: loggedIn,
  remove: () => {return false;}
});