import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { CarRecord } from '../models/car-record.model';
 
export const CarRecords = new MongoObservable.Collection<CarRecord>('carrecords');

function loggedIn() {
  return !!Meteor.user();
}

 
CarRecords.allow({
  insert: () => { return false },
  update: function(userId, doc, fields, modifier) { console.log(modifier); console.log(fields); return false },
  remove: () => { return false }
});