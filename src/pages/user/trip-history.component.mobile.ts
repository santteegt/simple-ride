import { Component, OnInit, OnDestroy } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor/meteor';
// import { InjectUser } from "angular2-meteor-accounts-ui";
// import { _ } from 'underscore';
declare var Meteor;
declare var _;
import { NavController, NavParams, ViewController, AlertController, LoadingController, ModalController } from 'ionic-angular';
import { Observable, Subscription, Subject } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";

import { TripUtils } from '../../classes/trip-utils.class';

import { TripMobileComponent } from '../trip/trip.component.mobile';
import { TripReviewMobileComponent } from '../trip/trip-review.component.mobile';

import { UserRating } from '../../shared/models/reservation.structure';
import { User, Trip, DELETIONREASONS, Reservation } from '../../shared/models';
import { Users, Trips, Reservations } from '../../shared/collections';

@Component({
  selector: 'trip-history',
  templateUrl: 'trip-history.component.mobile.html'
})
// @InjectUser('user')
export class TripHistoryMobileComponent implements OnInit, OnDestroy {

	tripUtils = TripUtils;

	myTripsSub: Subscription;
	mytrips: Observable<Trip[]>;

	rsvpSub: Subscription;
	rsvpList: Reservation[];

	usersSub: Subscription;
	userList: User[];

	tripModal: Component;
	tripReviewModal: Component;

	loader;

  user: any;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private alertCtrl: AlertController, private loadingCtrl: LoadingController,
		private modalCtrl: ModalController) {

		this.tripModal = TripMobileComponent;
		this.tripReviewModal = TripReviewMobileComponent;

	}

	ngOnInit() {
    MeteorObservable.autorun().subscribe(() => {
      this.user = Meteor.user();
    });
	}

	ngOnDestroy() {
		this.rsvpSub.unsubscribe();
		this.myTripsSub.unsubscribe();
		if(this.usersSub) {
			this.usersSub.unsubscribe();
		}

	}

	ionViewWillEnter() {

		this.loader = this.loadingCtrl.create({
	      content: "Cargando...",
	      spinner: "crescent"
	    });
    	this.loader.present();

		const options = {
			// limit: pageSize as number,
			// skip: ((curPage as number) - 1) * (pageSize as number),
			sort: {
				departureDate: 1,
				// departureTime: -1
			}
		};

		if (this.myTripsSub) {
			this.myTripsSub.unsubscribe();
		}

		if (this.rsvpSub) {
			this.rsvpSub.unsubscribe();
		}

		this.myTripsSub = MeteorObservable.subscribe('trips', options, true).subscribe(() => {
			let trips = Trips.find({
				$or: [
					{cancellation_date: {$ne: undefined }},
					{departureDate: {$lt: new Date()}}
					]
			});

			let trip_ids = _.map(trips.fetch(), function(trip: Trip) {
				return trip._id;
			});

			this.rsvpSub = MeteorObservable.subscribe('reservations', {}, false).subscribe(() => {

				this.rsvpList = Reservations.find({
					trip_id: {$in: trip_ids},
					cancellation_date: undefined,
					driver_rating: undefined
				}).fetch();

				this.loader.dismiss();
			});

			this.mytrips = trips.zone();

		});


	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	hasPendingReviews(trip: Trip) {
		let pendingReviews = _.filter(this.rsvpList, function(rsvp: Reservation) {
			return rsvp.trip_id == trip._id;
		});
		return pendingReviews && pendingReviews.length > 0;
	}

	openReviewsModal(trip: Trip) {

		if (this.usersSub) {
			this.usersSub.unsubscribe();
		}

		let pendingReviews = _.filter(this.rsvpList, function(rsvp: Reservation) {
			return rsvp.trip_id == trip._id;
		});

		let users = _.unique(_.map(pendingReviews, function(rsvp: Reservation) {
			return rsvp.user_id;
		}));

		this.usersSub = MeteorObservable.subscribe('user-public-data', users).subscribe(() => {
			let userList = Users.find({_id: {
				$in: users
			}}).fetch();

			userList = _.map(userList, function(user: User) {
				return {isDriver: false, user: user};

			});
			this.navigateTo(this.tripReviewModal, {'trip': trip, 'persons': userList, 'isPushNav': true});
			// this.openModal(this.tripReviewModal, {'trip': trip, 'persons': userList});

		});


	}

	navigateTo(component: any, params: Object) {
		this.navCtrl.push(component, params);
	}

	openModal(component: Component, params: Object) {
		let modal = this.modalCtrl.create(component, params);
		modal.present();

	}

}
