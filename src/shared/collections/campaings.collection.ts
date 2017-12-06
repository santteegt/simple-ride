import { MongoObservable } from 'meteor-rxjs';

import { Campaing } from '../models/campaing.model';

export const Campaings = new MongoObservable.Collection<Campaing>('campaings');

function loggedIn() {
  return !!Meteor.user();
}


Campaings.allow({
  insert: () => { return false; },
  update: () => { return false; },
  remove: () => { return false; }
});
