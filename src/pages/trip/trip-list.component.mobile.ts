import { Component, OnInit, OnDestroy } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor/meteor';
// import { _ } from 'underscore';
declare var Meteor;
declare var _;
import { NavController, NavParams, ViewController, AlertController,
		LoadingController, PopoverController, ModalController} from 'ionic-angular';
import { Observable, Subscription, Subject } from "rxjs";
import { MeteorObservable } from "meteor-rxjs"
// TODO:
// import { InjectUser } from "angular2-meteor-accounts-ui";

import { TripFilterMobileComponent } from './trip-filter.component.mobile';
import { UserProfileMobileComponent } from '../user/user-profile.component.mobile';
import { CheckoutMobileComponent } from '../checkout/checkout.component.mobile';
import { DetailedReservationMobileComponent } from './detailed-reservation.component.mobile';

import { TripUtils } from '../../classes/trip-utils.class';

import { UserRating } from '../../shared/models/reservation.structure';
import { Trip, User } from '../../shared/models';
import { Trips, Users, Reservations } from '../../shared/collections';

interface TripOptions {

	handBaggage?: boolean;
	baggage?: boolean;
	pets?: boolean;
	smoking?: boolean;
	food?: boolean;
	children?: boolean;

}

@Component({
  selector: 'trip-list',
  templateUrl: 'trip-list.component.mobile.html'
})
// TODO:
// @InjectUser('user')
export class TripListMobileComponent implements OnInit, OnDestroy {

	place: any;

	myTripsSub: Subscription;
	mytrips: Observable<Trip[]>;

	usersSub: Subscription;
	drivers: User[];

	driverRSVPSub: Subscription;
	driverRating: UserRating[];

	tripUtils = TripUtils;

	loader;

	filterSub: Subscription;
	dateFromFilter: Subject<Date> = new Subject<Date>();
	dateToFilter: Subject<Date> = new Subject<Date>();
	tripOptionsFilter: Subject<TripOptions> = new Subject<TripOptions>();

	user: any;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private alertCtrl: AlertController, private loadingCtrl: LoadingController,
		private modalCtrl: ModalController, private popoverCtrl: PopoverController) {

		this.place = navParams.get("place");

		this.driverRating = [];

	}

	ngOnInit() {

		MeteorObservable.autorun().subscribe(() => {
      this.user = Meteor.user();
    });

		const options = {
			// limit: pageSize as number,
			// skip: ((curPage as number) - 1) * (pageSize as number),
			sort: {
				departureDate: -1
			}
		};

		this.filterSub = Observable.combineLatest(
	      this.dateFromFilter,
	      this.dateToFilter,
	      this.tripOptionsFilter,
	    ).subscribe(([dateFrom, dateTo, tripOptions]) => {

	    	this.loader = this.loadingCtrl.create({
		      content: "Cargando...",
		      spinner: "crescent"
		    });
	    	this.loader.present();

	    	if (this.myTripsSub) {
				this.myTripsSub.unsubscribe();
			}

			if (this.usersSub) {
				this.usersSub.unsubscribe();
			}

			if (this.driverRSVPSub) {
				this.driverRSVPSub.unsubscribe();
			}

			this.myTripsSub = MeteorObservable.subscribe('trips', options, false).subscribe(() => {
				// let date = new Date();
		  // 		const threshold = 30 * 60000; // 30 minutes ahead
		  // 		date = new Date(date.getTime() + threshold);
		  // 		let time = date.getHours().toString() + ':' + date.getMinutes().toString();
		  // 		date.setHours(0); date.setMinutes(0); date.setSeconds(0); date.setMilliseconds(0);

				let predicate = {
					'destination.place_id': this.place.place_id,
					cancellation_reason: undefined,
					departureDate: {$gte: new Date(dateFrom)},
					driver_id: {$nin: [ Meteor.userId() ]}
				};

				if(_.keys(tripOptions).length > 0) {
					_.each(_.keys(tripOptions), function(option) {
						if(tripOptions[option]) {
							predicate['options.' + option] = tripOptions[option];
						}
					});
				}
				if(dateTo) {
					predicate['departureDate']['$lte'] = new Date(dateTo);
				}

				let trips = Trips.find(predicate);

				let tripArray = trips.fetch();

				let users = _.unique(_.map(tripArray, function(trip: Trip) {
					return trip.driver_id;
				}));

				this.usersSub = MeteorObservable.subscribe('user-public-data', users).subscribe(() => {
					this.drivers = Users.find({_id: {
						$in: users,
						$nin: [ Meteor.userId() ]
					}}).fetch();

					this.driverRSVPSub = MeteorObservable.subscribe('reservations', {}, false).subscribe(() => {

						let reservations = Reservations.find({
							'user_rating': {$ne: undefined},
							'driver_id': {$in: users}
						}).fetch();
						// this.getDriversRating();

						this.driverRating = this.tripUtils.calculateUsersRating(reservations, true);

					});

					this.loader.dismiss();
				});

				this.mytrips = trips.zone();

			});
		});
		this.dateFromFilter.next(new Date());
		this.dateToFilter.next(undefined);
		this.tripOptionsFilter.next({});

	}

	ngOnDestroy() {
		this.myTripsSub.unsubscribe();
		this.usersSub.unsubscribe();
		this.driverRSVPSub.unsubscribe();
		this.filterSub.unsubscribe();

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

	getTripDay(date: Date) {
		let day: string;
		// const today = new Date();
		// if(today.getDate() == date.getDate() && today.getMonth() == date.getMonth() && today.getFullYear() == date.getFullYear()) {
		// 	day = "Hoy";
		// } else {
			switch(date.getDay()) {
				case 0:
					day = "Domingo";
					break;
				case 1:
					day = "Lunes";
					break;
				case 2:
					day = "Martes";
					break;
				case 3:
					day = "Miércoles";
					break;
				case 4:
					day = "Jueves";
					break;
				case 5:
					day = "Viernes";
					break;
				case 6:
					day = "Sabado";
					break;
				default:
					break;
			}
		// }
		return day;
	}

	getDriverInfo(user_id: string) {
		return _.find(this.drivers, function(driver) {
			return driver._id == user_id;
		});

	}

	presentFilter(event: any) {
		let me = this;

		let popover = this.popoverCtrl.create(TripFilterMobileComponent, {
			callbackFrom: function(dateFrom) {
				me.dateFromFilter.next(dateFrom);
			},

			callbackTo: function(dateTo) {
				me.dateToFilter.next(dateTo);
			},

			callbackOptions: function(tripOptions) {
				me.tripOptionsFilter.next(tripOptions);
			}
	    });

	    popover.present({
	      ev: event
	    });

	}

	openDriverProfile(driver_id: string) {
		let user = _.find(this.drivers, function(driver) {
			return driver._id == driver_id;
		});
		let modal = this.modalCtrl.create(UserProfileMobileComponent, {user_id: driver_id, userData: user, isDriver: true});
		modal.present();
	}

	openTripDetails(trip: Trip) {
		let modal = this.modalCtrl.create(DetailedReservationMobileComponent, {
			'trip': trip,
			'driver': this.getDriverInfo(trip.driver_id)
		});
		modal.present();
	}

	openCheckout(trip_id: string) {
		let modal = this.modalCtrl.create(CheckoutMobileComponent, {'trip_id': trip_id});
		modal.present();
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

}
