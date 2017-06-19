import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { User } from "../models/user.model";
 
export const Users = MongoObservable.fromExisting(Meteor.users);
// export const Users = new MongoObservable.Collection<User>('userData');
 
// Users.allow({
//   insert: function(userId, doc) { return false },
//   update: function(userId, doc, fields, modifier) { return false },
//   remove: function(userId, doc) { return false }
// });