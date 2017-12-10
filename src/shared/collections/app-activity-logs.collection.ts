// TODO:
// import { Meteor } from 'meteor-client';
import { MongoObservable } from 'meteor-rxjs';

import { AppActivityLog } from '../models/app-activity-log.model';
 
export const AppActivityLogs = new MongoObservable.Collection<AppActivityLog>('app_activity_logs');

// function loggedIn() {
//   return !!Meteor.user();
// }
 
AppActivityLogs.allow({
  insert: () => {return false},
  update: () => {return false;},
  remove: () => {return false;}
});