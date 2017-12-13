// TODO:
// import { Meteor } from 'meteor-client';
import { MongoObservable } from 'meteor-rxjs';

import { ConfigVar } from '../models/config-var.model';
 
export const ConfigVars = new MongoObservable.Collection<ConfigVar>('configvars');

// function loggedIn() {
//   return !!Meteor.user();
// }
 
ConfigVars.allow({
  insert: () => {return false},
  update: () => {return false;},
  remove: () => {return false;}
});