import { MongoObservable } from 'meteor-rxjs';
// TODO:
// import { Meteor } from 'meteor/meteor';

import { UserPlace } from '../models/user-place.model';

export const UserPlaces = new MongoObservable.Collection<UserPlace>('userplaces');

function loggedIn() {
  return !!Meteor.user();
}


UserPlaces.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});
