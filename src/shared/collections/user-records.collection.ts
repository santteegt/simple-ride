import { MongoObservable } from 'meteor-rxjs';
// TODO:
// import { Meteor } from 'meteor-client';

import { UserRecord } from '../models/user-record.model';
 
export const UserRecords = new MongoObservable.Collection<UserRecord>('userrecords');

// function loggedIn() {
//   return !!Meteor.user();
// }

 
UserRecords.allow({
  insert: () => { return false },
  update: () => { return false },
  remove: () => { return false }
});