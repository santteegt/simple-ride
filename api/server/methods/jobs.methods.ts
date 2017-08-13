import { _ } from 'underscore';
import { Push } from 'meteor/raix:push';
import { Email } from 'meteor/email'
import { SSR } from 'meteor/meteorhacks:ssr';

import { Trips } from '../../both/collections/trips.collection';
import { Trip } from '../../both/models/trip.model';
import { Reservations } from '../../both/collections/reservations.collection';
import { Reservation, RESERVATIONSTATUS } from '../../both/models/reservation.model';
import { UserTripFlags } from "../../both/collections/user-trip-flags.collection";
import { UserTripFlag } from "../../both/models/user-trip-flag.model";
import { Notifications } from '../../both/collections/notifications.collection';
import { Notification, NotificationBody } from '../../both/models/notification.model';
import { Users } from '../../both/collections/users.collection';

declare var SyncedCron;

function generateUserVerificationCode(user_id: string, trip_id: string): string {
	return trip_id.substr(0, 3) + user_id.substr(0, 3);
}

SyncedCron.add({
  name: 'Activate users on trip mode',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.recur().on(14, 29, 44, 59).minute();
  },
  job: function() {
  	let currentTime = new Date();
  	let windowTime = new Date();
  	windowTime.setMinutes(windowTime.getMinutes() + 2);

  	let tripList = Trips.find(
  		{
  			$and: [
	  			{'departureDate': {$gte: currentTime}},
	  			{'departureDate': {$lte: windowTime}},
	  			{'cancellation_date': undefined}
			]
		}
	).fetch();

	_.each(tripList, function(trip: Trip) {
		UserTripFlags.insert({
			'user_id': trip.driver_id,
			'isDriver': true,
			'trip_id': trip._id,
			'active': true,
			'departure_date': trip.departureDate
		});
	});

	if(tripList.length > 0) {
		console.log('TOTAL NO OF TRIPS SCHEDULED NOW: ' + tripList.length);

		let trip_ids = _.map(tripList, function(trip: Trip) {
			return trip._id;
		});

		let rsvpList = Reservations.find({
			'trip_id': {$in: trip_ids},
			'payment_status': RESERVATIONSTATUS.PROCESSED,
			'cancellation_date': undefined
		}).fetch();

		_.each(rsvpList, function(rsvp: Reservation) {
			let user_id = rsvp.user_id;
			let trip_id = rsvp.trip_id;
			let verificationCode = generateUserVerificationCode(user_id, trip_id);
			UserTripFlags.insert({
				'user_id': user_id,
				'isDriver': false,
				'trip_id': trip_id,
				'active': true,
				'departure_date': rsvp.departure_date,
				'code': verificationCode
			});
		});

	} else {
		console.log('RIGHT NOW THERE ARE NO TRIPS SCHEDULED');
	}

  }
});

SyncedCron.add({
  name: 'Reminder to rate rides',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.recur().on(5, 12, 20).hour();
  },
  job: function() {
  	let currentTime = new Date();
  	let windowTime = new Date(currentTime.getTime() - (24*3600*1000));

  	let rsvpList = Reservations.find({
  		$and: [
	  		{'cancellation_date': undefined},
	  		{'departure_date': {$lte: windowTime}},
	  		{$or: [
	  			{'user_rating': undefined},
	  			{'driver_rating': undefined},
  			]}
  		]
	}).fetch();

  	if(rsvpList.length > 0) {

  		let notifiedUsers: string[] = [];

		_.each(rsvpList, function(rsvp: Reservation) {
			let trip: Trip = undefined;
			if(!rsvp.user_rating && _.indexOf(notifiedUsers, rsvp.trip_id + '|' + rsvp.user_id) == -1) {

				trip = Trips.findOne({_id: rsvp.trip_id});
				let user = Users.findOne({_id: rsvp.driver_id});

				let push_body: NotificationBody = {
			      title: 'Viaje a ' + trip.destination.shortName,
			      text: 'Gracias por tu viaje. Recuerda calificar tu viaje',
			      from: 'server',
			      badge: 1,
			      query: {userId: rsvp.user_id}
			    }

			    Notifications.insert({
			      user_id: rsvp.user_id,
			      sent_date: new Date(),
			      push_body: push_body,
			      read: false,
			      redirect_component: 'TripReviewMobileComponent',
			      redirect_params: {'trip': trip, 'rsvp': rsvp, 'persons': [{'isDriver': true, 'user': user}]},
			      from_user: undefined,
			      trip_id: rsvp.trip_id
			    });



			    notifiedUsers.push(rsvp.trip_id + '|' + rsvp.user_id);

			    Push.send(push_body);

			    let recipient = Users.findOne({_id: rsvp.user_id});
					if(recipient['personData']['email']){
						let to: string = recipient['personData']['email'];
						let from: string = 'info@simpleride-ec.com';
						let subject: string = 'Viaje a ' + trip.destination.shortName;
						let html: string = SSR.render("generalEmail", {title: subject, content: 'Gracias por tu viaje. Recuerda calificar tu viaje entrando en nuestra app'});
						Email.send({ to, from, subject, html });
					}

			}

			if(!rsvp.driver_rating && _.indexOf(notifiedUsers, rsvp.trip_id + '|' + rsvp.driver_id) == -1) {

				trip = trip ? trip:Trips.findOne({_id: rsvp.trip_id});

				let rsvpArray = Reservations.find({
					'trip_id': rsvp.trip_id,
					'cancellation_date': undefined,
					'driver_rating': undefined
				}).fetch();

				let users = _.map(rsvpArray, function(rsvp: Reservation) {
					return rsvp.user_id;
				});

				let userList = Users.find({_id: {
					$in: users
				}}).fetch();

				userList = _.map(userList, function(user) {
					return {isDriver: false, user: user};

				});

				let push_body: NotificationBody = {
			      title: 'Viaje a ' + trip.destination.shortName,
			      text: 'Gracias por tu viaje. Recuerda calificar a tus acompañantes',
			      from: 'server',
			      badge: 1,
			      query: {userId: rsvp.user_id}
			    }

			    Notifications.insert({
			      user_id: rsvp.driver_id,
			      sent_date: new Date(),
			      push_body: push_body,
			      read: false,
			      redirect_component: 'TripReviewMobileComponent',
			      redirect_params: {'trip': trip, 'persons': userList},
			      from_user: undefined,
			      trip_id: rsvp.trip_id
			    });

			    notifiedUsers.push(rsvp.trip_id + '|' + rsvp.driver_id);

			    Push.send(push_body);

			    let recipient = Users.findOne({_id: rsvp.driver_id});
					if(recipient['personData']['email']){
						let to: string = recipient['personData']['email'];
						let from: string = 'info@simpleride-ec.com';
						let subject: string = 'Viaje a ' + trip.destination.shortName;
						let html: string = SSR.render("generalEmail", {title: subject, content: 'Gracias por tu viaje. Recuerda calificar a tus acompañantes entrando en nuestra app'});
						Email.send({ to, from, subject, html });
					}

			}
		});

	} else {
		console.log('NO NOTIFICATIONS SENT FOR RATING TRIPS');
	}

  }

});

SyncedCron.add({
  name: 'Reminder to upload deposit',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.recur().on(8, 12, 16, 20).hour();
  },
  job: function() {

  	let currentTime = new Date();

  	let rsvpList = Reservations.find({
  		$and: [
	  		{'cancellation_date': undefined},
	  		{'payment_status': RESERVATIONSTATUS.WAITING_USER_ACTION},
	  		{'departure_date': {$gte: currentTime}}
  		]
	}).fetch();

	if(rsvpList.length == 0) {
		console.log('NO NOTIFICATIONS SENT FOR UPLOADING DEPOSIT VOUCHERS');
	} else {

		_.each(rsvpList, function(rsvp: Reservation) {

			let trip = Trips.findOne({_id: rsvp.trip_id});

			let push_body: NotificationBody = {
		      title: 'Viaje a ' + trip.destination.shortName,
		      text: 'Recuerda subir tu comprobante de pago',
		      from: 'server',
		      badge: 1,
		      query: {userId: rsvp.user_id}
		    }

		    Notifications.insert({
		      user_id: rsvp.user_id,
		      sent_date: new Date(),
		      push_body: push_body,
		      read: false,
		      redirect_component: 'UploadDepositVoucherMobileComponent',
		      redirect_params: {'rsvp': rsvp},
		      from_user: undefined,
		      trip_id: rsvp.trip_id
		    });

		    Push.send(push_body);

		    let recipient = Users.findOne({_id: rsvp.user_id});
				if(recipient['personData']['email']){
					let to: string = recipient['personData']['email'];
					let from: string = 'info@simpleride-ec.com';
					let subject: string = 'Viaje a ' + trip.destination.shortName;
					let html: string = SSR.render("generalEmail", {title: subject, content: 'Tu viaje ha sido reservado. Recuerda subir tu comprobante de pago desde nuestra app'});
					Email.send({ to, from, subject, html });
				}

		});

	}


  }
})
