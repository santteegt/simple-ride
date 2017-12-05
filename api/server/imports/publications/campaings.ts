import { Meteor } from 'meteor/meteor';

import { Campaings } from '../../../both/collections/campaings.collection';


interface Options {
  [key: string]: any;
}

Meteor.publish('campaings', function(options: Options) {
  return Campaings.find({active: true}, options);
});
