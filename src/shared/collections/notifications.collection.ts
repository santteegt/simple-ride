import { MongoObservable } from 'meteor-rxjs';
// TODO:
// import { Meteor } from 'meteor-client';

import { Notification } from '../models/notification.model';
 
export const Notifications = new MongoObservable.Collection<Notification>('notifications');

function loggedIn() {
  return !!Meteor.user();
}

 
Notifications.allow({
  insert: () => { return false; },
  update: loggedIn,
  remove: () => { return false; }
});