import { Meteor } from 'meteor/meteor';
import { MongoObservable } from 'meteor-rxjs';

import { Log } from '../models/log.model';
 
export const Logs = new MongoObservable.Collection<Log>('logs');

function loggedIn() {
  return !!Meteor.user();
}
 
Logs.allow({
  insert: () => {return true},
  update: () => {return false;},
  remove: () => {return false;}
});