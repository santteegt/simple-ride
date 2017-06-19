import { Meteor } from 'meteor/meteor';
import { Reservations } from '../../../both/collections/reservations.collection';
import { Counts } from 'meteor/tmeasday:publish-counts';


interface Options {
  [key: string]: any;
}

Meteor.publish('reservations', function(options: Options, ownerOnly?: boolean, driver_id?: string, trip_id?: string) {
	let selector = ownerOnly ? { user_id: this.userId }:{ }
	if(driver_id) {
		selector['driver_id'] = driver_id;
	}

	if(trip_id) {
  		Counts.publish(this, 'reservationsCount', 
  			Reservations.collection.find({trip_id: trip_id, cancellation_date: undefined}), {noReady: true});
  	}
	return Reservations.find(selector, options);
});
