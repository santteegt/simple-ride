import { Meteor } from 'meteor/meteor';
import { MongoObservable } from 'meteor-rxjs';

import { UserRideMonitor } from '../models/user-ride-monitor.model';
 
export const UserRideMonitors = new MongoObservable.Collection<UserRideMonitor>('user_ride_monitor');

function loggedIn() {
  return !!Meteor.user();
}
 
UserRideMonitors.allow({
  insert: loggedIn,
  update: () => {return false;},
  remove: () => {return false;}
});