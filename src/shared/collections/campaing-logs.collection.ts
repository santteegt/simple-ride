import { MongoObservable } from 'meteor-rxjs';

import { CampaingLog } from '../models/campaing-log.model';

export const CampaingLogs = new MongoObservable.Collection<CampaingLog>('campainglogs');

function loggedIn() {
  return !!Meteor.user();
}


CampaingLogs.allow({
  insert: loggedIn,
  update: () => { return false; },
  remove: () => { return false; }
});
