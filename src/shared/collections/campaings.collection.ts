import { MongoObservable } from 'meteor-rxjs';

import { Campaing } from '../models/campaing.model';

export const Campaings = new MongoObservable.Collection<Campaing>('campaings');

function loggedIn() {
  return !!Meteor.user();
}


Campaings.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: () => { return false; }
});
