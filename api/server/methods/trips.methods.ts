import { Meteor } from 'meteor/meteor';
import { _ } from 'underscore';
import { Push } from 'meteor/raix:push';
import { Email } from 'meteor/email';
import { SSR } from 'meteor/meteorhacks:ssr';

import { Users } from '../../both/collections/users.collection';
import { Places } from '../../both/collections/places.collection';
import { Place } from '../../both/models/place.model';
import { Trips } from '../../both/collections/trips.collection';
import { Trip } from '../../both/models/trip.model';
import { Reservations } from '../../both/collections/reservations.collection';
import { Reservation, RESERVATIONSTATUS } from '../../both/models/reservation.model';
import { UserTripFlags } from "../../both/collections/user-trip-flags.collection";
import { UserTripFlag } from "../../both/models/user-trip-flag.model";
import { ChatMessages } from '../../both/collections/chat-messages.collection';
import { MESSAGETYPES } from '../../both/models/chat-message.model';
import { Notifications } from '../../both/collections/notifications.collection';
import { Notification, NotificationBody } from '../../both/models/notification.model';
import { PromoCodes } from '../../both/collections/promo-codes.collection';
import { PromoCode, PROMOTYPES } from '../../both/models/promo-code.model';

SSR.compileTemplate('generalEmail', Assets.getText("email-templates/general-email.html"));
SSR.compileTemplate('voucherEmail', Assets.getText("email-templates/voucher-email.html"));

function getPlaceDetails(place_id: string, place: Place) {
	return Meteor['http'].call("GET",
		"https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyA4o5dp21Sdw7vyUO0iC5mua7f9gMx6_2w&placeid=" + place_id,
		function(error, result) {
			if(!error) {
				let placeDetails = JSON.parse(result.content);
				placeDetails = placeDetails.result;
			  	place.lat = placeDetails.geometry.location.lat;
			  	place.lng = placeDetails.geometry.location.lng;
			  	let photos = placeDetails.photos;
			  	let randomPhoto: string;
			  	if(photos) {
			  		let index = Math.ceil((Math.random() * photos.length) -1);
			  		randomPhoto = photos[index].photo_reference;
			  	}
		  		place.photoURL = randomPhoto != undefined ? getPlaceImage(randomPhoto):'';
		  		Places.insert(place);

			} else {
				console.log(error);
			}
		});
}

function getPlaceImage(photo_reference: string) {
	// if(Meteor.isServer) {
		return "https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyA4o5dp21Sdw7vyUO0iC5mua7f9gMx6_2w&maxwidth=600&photoreference=" + photo_reference;
	// }
}

function sendSystemMessage(user_id: string, trip_id: string, is_driver: boolean, message: string) {
  let user = Users.findOne({_id: user_id});
  let today = new Date();
  let hour = today.getHours() < 10 ? '0' + today.getHours():today.getHours();
  let minutes = today.getMinutes() < 10 ? '0' + today.getMinutes():today.getMinutes();
  ChatMessages.insert({
    trip_id: trip_id,
    user_id: user_id,
    user_forename: user['personData']['forename'],
    user_surname: user['personData']['surname'],
    user_profileImg: user['personData']['profileImg'],
    is_driver: is_driver,
    message_type: MESSAGETYPES.SYSTEM,
    message_date: today,
    message_time: hour + ':' + minutes,
    message: user['personData']['forename'] + ' ' + message

  });
}

function sendPushNotification(title: string, text: string, user_id?: string, redirect_component?: string,
  redirect_params?: any, from_user?: string, trip_id?: string, save_notification?: boolean) {
    let push_body: NotificationBody = {
      title: title,
      text: text,
      from: 'server',
      badge: 1,
      query: {}
    }
    if(user_id) {
      push_body.query = { userId: user_id };
    }

		if(save_notification){
	    Notifications.insert({
	      user_id: user_id,
	      sent_date: new Date(),
	      push_body: push_body,
	      read: false,
	      redirect_component: redirect_component,
	      redirect_params: redirect_params,
	      from_user: from_user,
	      trip_id: trip_id
	    });
		}

    Push.send(push_body);

    let recipient = Users.findOne({_id: user_id});
		if(recipient['personData']['email']){
			let to: string = recipient['personData']['email'];
			let from: string = 'info@simpleride-ec.com';
			let subject: string = title;
			let html: string = SSR.render("generalEmail", {title: title, content: text});
			sendEmail(to, from, subject, html);
		}
}

async function sendEmail(to: string, from: string, subject: string, html: string){
	Email.send({ to, from, subject, html });
}

export function cancelReservation(rsvp: Reservation, reason: number){
	let user = Users.findOne({_id: rsvp.user_id});
	let trip = Trips.findOne({_id: rsvp.trip_id});
	Trips.update({_id: trip._id}, {$set: {available_places: trip.available_places + rsvp.places}});
	Reservations.update({_id: rsvp._id}, {$set: {cancellation_date: new Date, cancellation_reason: reason}});
	switch (reason) {
		case 0: // He decidido no viajar
			sendSystemMessage(rsvp.user_id, rsvp.trip_id, false, 'ha cancelado su reserva');

			trip = Trips.findOne({_id: rsvp.trip_id});
			sendPushNotification('¡Viaje a ' + trip.destination.shortName, user['personData'].forename + ' ha cancelado su reserva!',
				rsvp.driver_id, 'TripMobileComponent', {'trip': trip}, rsvp.user_id, rsvp.trip_id, true);
			break;
		case 1: // Reserva Cancelada por el conductor
			sendSystemMessage(rsvp.driver_id, rsvp.trip_id, true, 'no aceptó la reserva de ' + user['personData'].forename);

			sendPushNotification('¡Viaje a ' + trip.destination.shortName, 'El conductor no ha aceptado tu reserva!', rsvp.user_id,
			'MyTripsMobileComponent', {}, rsvp.driver_id, rsvp.trip_id, true);
			break;
		case 2: // Viaje Cancelado por el conductor
			sendSystemMessage(trip.driver_id, trip._id, true, 'ha cancelado el viaje');

			sendPushNotification('Viaje a ' + trip.destination.shortName, '¡El conductor ha cancelado su viaje!', rsvp.user_id, 'MyTripsMobileComponent', {}, rsvp.driver_id, rsvp.trip_id, true);
			break;
		case 3: // Viaje Cancelado automáticamente antes de iniciar el viaje por que no se subio el comprobante
			sendPushNotification('¡Viaje a ' + trip.destination.shortName, 'Tu reserva para el viaje a '+ trip.destination.shortName +' ha sido cancelada por falta de confirmación antes de iniciar el viaje.', rsvp.user_id, '', {}, 'server', rsvp.trip_id, false);
			break;
		case 4: // Viaje Cancelado automáticamente despues de 24 horas que no se subio el comprobante
			sendPushNotification('¡Viaje a ' + trip.destination.shortName, 'Tu reserva para el viaje a '+ trip.destination.shortName +' ha sido cancelada por falta de confirmación. Por favor vuelve a reservar tu lugar.', rsvp.user_id, '', {}, 'server', rsvp.trip_id, false);
			break;
		default:
			break;
	}
}

Meteor.methods({
  registerPlace: function (place_id: string, place: Place) {
  	if(Meteor.isServer) {
	  	if(Places.find({place_id: place_id}).fetch().length == 0) {
	  		getPlaceDetails(place_id, place);
	  	}
  	}

  },

  deleteTrip: function(trip: Trip, reason: number) {

    let rsvpList: Reservation[] = Reservations.find({'trip_id': trip._id, 'cancellation_reason': null}).fetch();

    _.each(rsvpList, function(rsvp: Reservation) {
			cancelReservation(rsvp, 2);
    });

  	let rs = Trips.update({_id: trip._id}, {$set: {cancellation_date: new Date(), cancellation_reason: reason}});
  	// throw new Meteor.Error("logged-out", "The user must be logged in to post a comment.");

  	return {processed: true, result: rs};

  },

  cancelReservation: function(rsvp: Reservation, reason: number) {
		cancelReservation(rsvp, reason);
    return {processed: true, result: rsvp};
  },

  validatePin: function(travelPin: string) {

    let pin = PromoCodes.findOne({
      'promoType': PROMOTYPES.PIN, 
      'code': travelPin, 
      'expirationDate': {$gte: new Date()},
      'active': true
    });

    return {valid: pin ? true:false}

  },

  joinTrip: function(reservation: Reservation) {
  	if(Meteor.isServer) {
  		let reservations = Reservations.find({
  			'trip_id': reservation.trip_id,
  			'user_id': reservation.user_id,
  			'driver_id': reservation.driver_id,
  			'cancellation_date': undefined
  		});
  		if(reservations.fetch().length > 0) {
			return {status: 400, message: 'Este usuario ya tiene una reserva para este viaje. Si desea reservar más asientos, cancele su reserva actual y genere una nueva.'};
  		}
  		let trip = Trips.findOne({'_id': reservation.trip_id});
  		if(trip.cancellation_date) {
  			return {status: 400, message: 'El viaje ha sido cancelado por el conductor'};
  		}
  		if(reservation.places > trip.available_places) {
  			return {status: 400, message: 'El conductor ya no dispone de ' + reservation.places + ' lugare(s) en su viaje. Revise el detalle del viaje nuevamente.'};
  		}
  		switch (reservation.payment_method) {
        case "pin":
          //do nothing.  Wait for user action if driver needs to approve reservation
          break;
  			case "deposit":
  				// do nothing. Wait for user action.
  				break;
  			case "card":
  				break;
  			case "electronic-money":
  				break;
  			case "promo":
  				break;
  			default:
  				break;
  		}
  		Trips.update({'_id': reservation.trip_id}, {$set: {'available_places': trip.available_places - reservation.places}});
  		Reservations.insert(reservation);

      sendSystemMessage(reservation.user_id, reservation.trip_id, false, 'se ha unido a este viaje');

      trip = Trips.findOne({'_id': reservation.trip_id});
      sendPushNotification('Viaje a ' + trip.destination.shortName, '¡Tienes una nueva reserva!', reservation.driver_id,
        'TripMobileComponent', {'trip': trip}, reservation.user_id, reservation.trip_id, true);

  		return {status: 200, message: 'OK'}
  	}

  },

  acceptReservation: function(rsvp: Reservation) {
    let user = Users.findOne({_id: rsvp.user_id});
    let trip = Trips.findOne({_id: rsvp.trip_id});
    let status = rsvp.payment_method == "pin" ? RESERVATIONSTATUS.PROCESSED:
      (rsvp.payment_method == "deposit" ? RESERVATIONSTATUS.WAITING_USER_ACTION:RESERVATIONSTATUS.PROCESSING_PAYMENT);
    Reservations.update({'_id': rsvp._id}, {$set: {payment_status: status}});

    sendSystemMessage(rsvp.driver_id, rsvp.trip_id, true, 'ha aceptado a ' + user['personData']['forename']);

    sendPushNotification('Viaje a ' + trip.destination.shortName, '¡El conductor ha aprobado tu reserva!', rsvp.user_id,
        'MyTripsMobileComponent', {}, null, rsvp.trip_id, true);

    return {processed: true, result: {}};
  },

  processPayment: function(payment_method: string, rsvp_id: string) {
  	if(Meteor.isServer) {
  		let rs = {};
	  	switch (payment_method) {
        case "pin":
          //do nothing
          break;
  			case "deposit":
  				Reservations.update({'_id': rsvp_id}, {$set: {payment_status: RESERVATIONSTATUS.PROCESSING_PAYMENT}});
  				rs = {status: 200, message: 'OK'};
  				break;
  			case "card":
  				break;
  			case "electronic-money":
  				break;
  			case "promo":
  				break;
  			default:
  				rs = {status: 400, message: 'No existe ese método de pago'};
  				break;
  		}
  		return rs;

  	}
  },


  finishTrip: function(trip_id: string) {
    UserTripFlags.update({'trip_id': trip_id}, {$set: {active: false, arrival_date: new Date()}}, {'multi': true});
    let rs = {status: 200, message: 'OK'};
    return rs;

  },

	getSuggestedPrice: function(distance: number){
		let kmPrice: number = 0;
		let suggestedPrice: number, minPrice: number;
		if(distance >= 0 && distance <= 50){
			kmPrice = 0.021;
		}else if(distance > 50 && distance <= 100){
			kmPrice = 0.02;
		}else if(distance > 100 && distance <= 150){
			kmPrice = 0.019;
		}else if(distance > 150 && distance <= 250){
			kmPrice = 0.018;
		}else if(distance > 250 && distance <= 350){
			kmPrice = 0.017;
		}else if(distance > 350 && distance <= 450){
			kmPrice = 0.016;
		}else if(distance > 450 && distance <= 500){
			kmPrice = 0.015;
		}else if(distance > 500){
			kmPrice = 0.013;
		}
		suggestedPrice = kmPrice * distance * 1.39 / 1000;
		minPrice = Math.round(suggestedPrice - (20*suggestedPrice/100));
		if(suggestedPrice<0.5) {
			suggestedPrice = minPrice = 0.5;
		}
		return {
			processed: true,
			result: {
				suggestedPrice: suggestedPrice,
				minPrice: minPrice,
				maxPrice: Math.round(suggestedPrice * 2)
			}
		};
	},

  /**
  * push notifications for chat messages
  */
  notify: function(sender_id: string, trip_id: string, is_driver: boolean) {

    let query = is_driver ? {'trip_id': trip_id, 'cancellation_reason': null, 'payment_status': RESERVATIONSTATUS.PROCESSED}:
      {'trip_id': trip_id, 'cancellation_reason': null, 'user_id': {$nin: [sender_id]}};
    let rsvpList: Reservation[] = Reservations.find(query).fetch();
    let users_id: string[] = _.map(rsvpList, function(rsvp: Reservation) {
      return rsvp.user_id;
    });

    let trip = Trips.findOne({_id: trip_id});
    if(!is_driver) {
      users_id.push(trip.driver_id);
    }

    _.each(users_id, function(user_id: string) {
      let recipient_is_driver = user_id == trip.driver_id;
			sendPushNotification('Viaje a ' + trip.destination.shortName, '¡Tienes un nuevo mensaje!', user_id,
	        'TripMessageBoardMobileComponent', {'trip': trip, 'push_is_driver': recipient_is_driver}, sender_id, trip_id, new Date() < trip.departureDate);
    });

    return {status: 200, message: 'OK'};

  },

  notifyPayment: function(rsvp_id: string, approved: boolean) {
    let rsvp = Reservations.findOne({_id: rsvp_id});
    let trip = Trips.findOne({_id: rsvp.trip_id});
    let user = Users.findOne({_id: rsvp.user_id});

    if(approved) {
			Trips.update({'_id': rsvp.trip_id}, {$set: {'confirmed_places': trip.confirmed_places + rsvp.places}});
      sendPushNotification('Viaje a ' + trip.destination.shortName, '¡Tu pago ha sido aprobado!', rsvp.user_id,
        'MyTripsMobileComponent', {}, null, rsvp.trip_id, true);

      sendPushNotification('Viaje a ' + trip.destination.shortName, '¡La reserva de ' + user['personData'].forename + ' ha sido aprobada!', rsvp.driver_id,
        'TripMobileComponent', {'trip': trip, 'readOnly': true}, rsvp.user_id, rsvp.trip_id, true);

			if(user['personData']['email']){
				let to: string = user['personData']['email'];
				let from: string = 'info@simpleride-ec.com';
				let subject: string = 'Comprobante de Pago';
				let utility = rsvp.total * .15;
				let expenses = utility / 1.12;
				let html: string = SSR.render("voucherEmail", {totalPayment: rsvp.total, reservedSits: rsvp.places, origin: trip.origin.shortName, destination: trip.destination.shortName, departureDate: trip.departureDate.toLocaleDateString(), departureTime: trip.departureTime, expenses: expenses.toFixed(2), insurance: (rsvp.total * .1).toFixed(2), iva: (expenses * .12).toFixed(2)});
				sendEmail(to, from, subject, html);
			}
    } else {
      sendPushNotification('Viaje a ' + trip.destination.shortName, '¡Tu pago ha sido rechazado!', rsvp.user_id,
        'UploadDepositVoucherMobileComponent', {rsvp: rsvp}, null, rsvp.trip_id, true);
    }

    return {status: 200, message: 'OK'};
  },

  getTripSharingDetails: function(trip_id: string) {
    let trip = Trips.findOne({_id: trip_id, cancellation_date: undefined}, {fields: {
      'origin.shortName': 1,
      'destination.shortName': 1,
      'departureDate': 1,
      'departureTime': 1,
      'price': 1,
      'available_places': 1
    }});


    if(trip) {
      return {processed: true, result: trip};
    } else {
      return {processed: false, result: null};
    }

  }

})
