import { MongoObservable } from 'meteor-rxjs';
// TODO:
// import { Meteor } from 'meteor-client';

import { PromoCode } from '../models/promo-code.model';
 
export const PromoCodes = new MongoObservable.Collection<PromoCode>('promocodes');


 PromoCodes.allow({
  insert: () => { return false },
  update: () => { return false },
  remove: () => { return false }
});