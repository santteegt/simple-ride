import { Meteor } from 'meteor/meteor';
// import { Counts } from 'meteor/tmeasday:publish-counts';

import { Trips } from '../../../both/collections/trips.collection';
 

interface Options {
  [key: string]: any;
}
 
Meteor.publish('trips', function(options: Options, ownerOnly?: boolean) {
  const selector = buildQuery.call(this, null, ownerOnly);
 
  // Counts.publish(this, 'numberOfParties', Parties.collection.find(selector), { noReady: true });
 
  return Trips.find(selector, options);
});

// Meteor.publish('party', function(partyId: string) {
//   return Parties.find(buildQuery.call(this, partyId));
// });


function buildQuery(tripId?: string, ownerOnly?: boolean): Object {
  // const isAvailable = {
  //   $or: [{
  //     // party is public
  //     public: true
  //   },
  //   // or
  //   { 
  //     // current user is the owner
  //     $and: [{
  //       owner: this.userId 
  //     }, {
  //       owner: {
  //         $exists: true
  //       }
  //     }]
  //   },
  //   {
  //     $and: [
  //       { invited: this.userId },
  //       { invited: { $exists: true } }
  //     ]
  //   }]
  // };

  // if (tripId) {
  //   return {
  //     // only single party
  //     $and: [{
  //         _id: partyId
  //       },
  //       isAvailable
  //     ]
  //   };
  // }

  // const searchRegEx = { '$regex': '.*' + (location || '') + '.*', '$options': 'i' };
 
  // return {
  //   $and: [{
  //       'location.name': searchRegEx
  //     },
  //     isAvailable
  //   ]
  // };
  let selector = ownerOnly ? {
    driver_id: this.userId
  }
  :{

  }
  console.log(selector);
  return selector;
}