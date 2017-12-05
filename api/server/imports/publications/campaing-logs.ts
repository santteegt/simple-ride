import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Campaings } from '../../../both/collections/campaings.collection';
import { CampaingLogs } from '../../../both/collections/campaing-logs.collection';


interface Options {
  [key: string]: any;
}

Meteor.publish('campaing-logs', function(campaing_id:string, options: Options) {
  return CampaingLogs.find({campaing_id: campaing_id}, options);
});
