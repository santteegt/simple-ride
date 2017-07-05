import { Component, OnInit, OnDestroy } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor/meteor';
// import { _ } from "underscore";
declare var Meteor;
declare var _;
import { NavController, NavParams, ViewController, AlertController, LoadingController, ModalController } from 'ionic-angular';
import { InjectUser } from "angular2-meteor-accounts-ui";
import { Observable, Subscription, Subject } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";

import { TripUtils } from '../../classes/trip-utils.class';
import { UserProfileMobileComponent } from '../user/user-profile.component.mobile';
import { CheckoutMobileComponent } from '../checkout/checkout.component.mobile';


import { UserRating } from '../../shared/models/reservation.structure';
import { Trip, User, Reservation, RESERVATIONSTATUS } from '../../shared/models';
import { Trips, Users, Reservations } from '../../shared/collections';

import template from './detailed-reservation.component.mobile.html';

@Component({
  selector: 'detailed-trip',
  templateUrl: 'detailed-reservation.component.mobile.html',
})
// @InjectUser('user')
export class DetailedReservationMobileComponent implements OnInit, OnDestroy {

	isPushNav: boolean;

	trip: Trip;
	rsvp: Reservation;
	driver: User;

	tripUtils = TripUtils;

	rsvpSub: Subscription;
	rsvpRelated: Reservation[];
	driverRating: UserRating[];

	travellersSub: Subscription;
	travellers: Observable<User[]>;
	travellerCount: number;

	loader;

	loadingImgs: any;
  user: any;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private alertCtrl: AlertController, private loadingCtrl: LoadingController, private modalCtrl: ModalController) {

		this.trip = navParams.get("trip");
    console.log(this.trip);
		this.rsvp = navParams.get("rsvp"); // optional. Only when showing reservation details
		this.driver = navParams.get("driver");
		this.isPushNav = navParams.get("isPushNav");
		this.travellerCount = 0;
		this.loadingImgs = {};
	}

	ngOnInit() {

    MeteorObservable.autorun().subscribe(() => {
      this.user = Meteor.user();
    });

		this.loader = this.loadingCtrl.create({
	      content: "Cargando...",
	      spinner: "crescent"
	    });
    	this.loader.present();

		if(this.rsvpSub) {
    		this.rsvpSub.unsubscribe();
    	}


		if (this.travellersSub) {
			this.travellersSub.unsubscribe();
		}

		this.rsvpSub = MeteorObservable.subscribe('reservations', {sort: {'reservation_date': -1}}, false).subscribe(() => {

			let reservations = Reservations.find({
				'trip_id': this.trip._id,
				'cancellation_date': undefined,
				'payment_status': RESERVATIONSTATUS.PROCESSED
			});

			this.rsvpRelated = reservations.fetch();

			let travellers_ids = _.map(this.rsvpRelated, function(reservation: Reservation) {
				return reservation.user_id;
			});

			let driverRSVP = Reservations.find({
				'driver_id': this.trip.driver_id,
				'user_rating': {$ne: undefined}
			}).fetch();

			this.driverRating = this.tripUtils.calculateUsersRating(driverRSVP, true);

			this.travellersSub = MeteorObservable.subscribe('user-public-data', travellers_ids).subscribe(() => {
				let travellers = Users.find({_id: {
					$in: travellers_ids,
					$nin: [ Meteor.userId() ]
				}});

				this.travellerCount = travellers.fetch().length;
				this.travellers = travellers.zone();

				this.loader.dismiss();
			});

		});

	}

	getTravellerReservedPlaces(user_id: string) {
		if(this.rsvpRelated && this.rsvpRelated.length > 0) {
			let rsvp = _.find(this.rsvpRelated, function(rsvp: Reservation) {
				return rsvp.user_id == user_id;
			});
			return rsvp.places;
		} else {
			return 0;
		}

	}

	getDriverRating(driver_id: string) {
		if(this.driverRating && this.driverRating.length > 0) {
			let driverRating = _.find(this.driverRating, function(driverRating: UserRating) {
				return driverRating.user_id == driver_id;
			});
			return driverRating.score;
		} else {
			return 0;
		}

	}

	openDriverProfile() {
		let modal = this.modalCtrl.create(UserProfileMobileComponent, {user_id: this.driver._id, userData: this.driver, isDriver: true});
		modal.present();
	}

	loadedImg(id: string) {
		this.loadingImgs[id] = true;
	}

	ngOnDestroy() {
		this.travellersSub.unsubscribe();
		this.rsvpSub.unsubscribe();

	}

	openCheckout(trip_id: string) {
    let modal = this.modalCtrl.create(CheckoutMobileComponent, {'trip_id': trip_id});
		modal.present();
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}



}
