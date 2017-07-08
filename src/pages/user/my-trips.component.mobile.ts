import { Component, OnInit, OnDestroy } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor/meteor';
// import { InjectUser } from "angular2-meteor-accounts-ui";
// import { _ } from 'underscore';
declare var Meteor;
declare var _;
import { NavController, NavParams, ViewController, AlertController,
		LoadingController, PopoverController, ModalController} from 'ionic-angular';
import { Observable, Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";

import { TripMobileComponent } from '../trip/trip.component.mobile';
import { UserProfileMobileComponent } from './user-profile.component.mobile';
import { DetailedReservationMobileComponent } from '../trip/detailed-reservation.component.mobile';
import { TripMessageBoardMobileComponent } from '../trip/trip-message-board.component.mobile';
import { TripReviewMobileComponent } from '../trip/trip-review.component.mobile';
import { UploadDepositVoucherMobileComponent } from '../checkout/upload-deposit-voucher.component.mobile';

import { TripUtils } from '../../classes/trip-utils.class';

import { UserRating } from '../../shared/models/reservation.structure';
import { User, Trip, Reservation, RESERVATIONSTATUS, CANCELLATIONREASONS } from '../../shared/models';
import { Users, Trips, Reservations } from '../../shared/collections';


interface ServerResponse {
	processed: boolean;
	rs: any;
}

@Component({
  selector: 'my-trips',
  templateUrl: 'my-trips.component.mobile.html'
})
// TODO:
// @InjectUser('user')
export class MyTripsMobileComponent implements OnInit, OnDestroy {

	myRSVPSub: Subscription;
	myRSVPs: Observable<Reservation[]>;
	myPastRSVPs: Observable<Reservation[]>;
	reservations: Reservation[];

	hasRSVP: boolean;
	hasPastRSVP: boolean;

	myTripsSub: Subscription;
	// mytrips: Observable<Trip[]>;
	trips: Trip[];

	driverRSVPSub: Subscription;
	driverRSVPs: Reservation[];
	driverRating: UserRating[];

	usersSub: Subscription;
	drivers: User[];


	tripUtils = TripUtils;

	card: string;
	loader;
	showDetail: boolean[];
	showPDetail: boolean[];

	paymentManagementModal: Component;
	reservationDetailModal: Component;
	tripReviewModal: Component;
	messageBoardModal: Component;

	loadingImgs: any;

	user: any;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private alertCtrl: AlertController, private loadingCtrl: LoadingController,
		private modalCtrl: ModalController, private popoverCtrl: PopoverController) {

		this.card = "reservations";
		this.trips = [];
		this.drivers = [];
		this.driverRSVPs = [];
		this.driverRating = [];
		this.showDetail = [];
		this.showPDetail = [];

		this.reservationDetailModal = DetailedReservationMobileComponent;
		this.messageBoardModal = TripMessageBoardMobileComponent;
		this.tripReviewModal = TripReviewMobileComponent;
		this.paymentManagementModal = UploadDepositVoucherMobileComponent;

		this.loadingImgs = {};
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


    	this.loader = this.loadingCtrl.create({
	      content: "Cargando...",
	      spinner: "crescent"
	    });
    	this.loader.present();

    	if(this.myRSVPSub) {
    		this.myRSVPSub.unsubscribe();
    	}

    	if (this.myTripsSub) {
			this.myTripsSub.unsubscribe();
		}

		if (this.usersSub) {
			this.usersSub.unsubscribe();
		}

		// if (this.driverRSVPSub) {
		// 	this.driverRSVPSub.unsubscribe();
		// }

		this.myRSVPSub = MeteorObservable.subscribe('reservations', {sort: {'reservation_date': -1}}, false).subscribe(() => {

			let reservations = Reservations.find({
				'user_id': Meteor.userId(),
				'cancellation_date': undefined,
				'departure_date': {$gte: new Date()}
			});

			let pastReservations = Reservations.find({
				'user_id': Meteor.userId(),
				$or: [
					{ 'cancellation_date': {$ne: undefined} },
					{ 'departure_date': {$lt: new Date()} }
				]
			});

			let trip_ids = _.map(reservations.fetch(), function(reservation: Reservation) {
				return reservation.trip_id;
			});

			let pastTrip_ids = _.map(pastReservations.fetch(), function(reservation: Reservation) {
				return reservation.trip_id;
			});

			let driver_ids = _.map(reservations.fetch(), function(reservation: Reservation) {
				return reservation.driver_id;
			});

			let pastDriver_ids = _.map(pastReservations.fetch(), function(reservation: Reservation) {
				return reservation.driver_id;
			});

			trip_ids = _.union(trip_ids, pastTrip_ids);
			driver_ids = _.union(driver_ids, pastDriver_ids);

			this.driverRSVPs = Reservations.find({
				'user_rating': {$ne: undefined},
				'driver_id': {$in: driver_ids}
			}).fetch();
			// this.getDriversRating();

			this.driverRating = this.tripUtils.calculateUsersRating(this.driverRSVPs, true);

			this.myTripsSub = MeteorObservable.subscribe('trips', options, true).subscribe(() => {

				let trips = Trips.find({'_id': {$in: trip_ids}});

				this.trips = trips.fetch();

				let users = _.unique(_.map(this.trips, function(trip: Trip) {
					return trip.driver_id;
				}));

				this.usersSub = MeteorObservable.subscribe('user-public-data', users).subscribe(() => {
					this.drivers = Users.find({_id: {
						$in: users,
						$nin: [ Meteor.userId() ]
					}}).fetch();

					this.loader.dismiss();
				});

				// this.mytrips = trips.zone();

			});


			this.myRSVPs = reservations.zone();
			reservations.subscribe((data: Reservation[]) => {
				this.hasRSVP = data && data.length > 0;
			});
			this.myPastRSVPs = pastReservations.zone();
			pastReservations.subscribe((data: Reservation[]) => {
				this.hasPastRSVP = data && data.length > 0;
			});
		});

	}

	ngOnDestroy() {
		// this.driverRSVPSub.unsubscribe();
		this.usersSub.unsubscribe();
		this.myTripsSub.unsubscribe();
		this.myRSVPSub.unsubscribe();

	}

	getDriverRating(driver_id: string) {
		if(this.driverRating && this.driverRating.length > 0) {
			let driverRating = _.find(this.driverRating, function(driverRating: UserRating) {
				return driverRating.user_id == driver_id;
			});
			return driverRating ? driverRating.score:0;
		} else {
			return 0;
		}

	}

	getTripDay(date: Date) {
		let day: string;
		const today = new Date();
		if(today.getDate() == date.getDate() && today.getMonth() == date.getMonth() && today.getFullYear() == date.getFullYear()) {
			day = "Hoy";
		} else {
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
		}
		return day;
	}

	getDriverInfo(user_id: string) {
		return _.find(this.drivers, function(driver) {
			return driver._id == user_id;
		});

	}

	getTripInfo(trip_id: string) {
		return _.find(this.trips, function(trip) {
			return trip._id == trip_id;
		});

	}

	openDriverProfile(driver_id: string) {
		let user = _.find(this.drivers, function(driver) {
			return driver._id == driver_id;
		});
		let modal = this.modalCtrl.create(UserProfileMobileComponent, {user_id: driver_id, userData: user, isDriver: true});
		modal.present();

	}

	openModal(component: Component, params: Object) {
		let modal = this.modalCtrl.create(component, params);
		modal.present();

	}

	navigateTo(component: any, params: Object) {
		this.navCtrl.push(component, params);
	}

	openTripDetails(trip: Trip) {
		let modal = this.modalCtrl.create(TripMobileComponent, {'trip': trip});
		modal.present();

	}

	showDetails(position: number) {
		this.showDetail[position] = !this.showDetail[position];

	}

	showPDetails(position: number) {
		this.showPDetail[position] = !this.showPDetail[position];

	}

	showPaymentManagementButton(reservation: Reservation) {
		return reservation.payment_status == RESERVATIONSTATUS.WAITING_USER_ACTION;

	}

	showPaymentStatus(rsvp: Reservation) {
		return rsvp.payment_status == RESERVATIONSTATUS.WAITING_DRIVER_CONFIRMATION || rsvp.payment_status == RESERVATIONSTATUS.PROCESSING_PAYMENT;
	}

	showPaymentSuccess(rsvp: Reservation) {
		return rsvp.payment_status == RESERVATIONSTATUS.PROCESSED;
	}

	paymentStatus(rsvp: Reservation) {
		let message: string;
		switch(rsvp.payment_status) {
			case RESERVATIONSTATUS.WAITING_DRIVER_CONFIRMATION:
				message = "ESPERANDO CONFIRMACIÓN"
				break;
			case RESERVATIONSTATUS.PROCESSING_PAYMENT:
				message = "ESPERANDO CONFIRMACIÓN"
				break;
			case RESERVATIONSTATUS.PROCESSED:
				message = "PAGO CONFIRMADO"
				break;
			default:
				message = "";
				break;

		}
		return message;
	}

	cancelReservation(rsvp: Reservation) {
		let trip = this.getTripInfo(rsvp.trip_id);
		let confirm = this.alertCtrl.create({
			title: 'Cancelar Reserva',
			message: '¿Está seguro que desea cancelar su viaje ' + trip.origin.shortName + '-' + trip.destination.shortName
						+ ' del ' + trip.departureDate.toLocaleDateString() + '?',
			buttons: [
			{
			  text: 'No',
			  handler: () => {
			  }
			},
			{
			  text: 'Si',
			  handler: () => {
			  	this.getRSVPDeleteReasons(rsvp);

			  }
			}]
		});
		confirm.present();
	}

	getRSVPDeleteReasons(rsvp: Reservation) {
		const me = this;
		let alert = this.alertCtrl.create();
	    alert.setTitle('¿Por qué cancelas tu reserva?');

	    let first: boolean = true;
	    for(let i=0; i < CANCELLATIONREASONS.reasons.length; i++) {
	    	if(CANCELLATIONREASONS.reasons[i].show) {
		    	alert.addInput({
			      type: 'radio',
			      label: CANCELLATIONREASONS.reasons[i].reason,
			      value: CANCELLATIONREASONS.reasons[i].id.toString(),
			      checked: first
			    });
			    first = false;
			}
	    }

	    alert.addButton('Cancelar');
	    alert.addButton({
			text: 'Confirmar',
			handler: data => {

				MeteorObservable.call('cancelReservation', rsvp, parseInt(data)).subscribe((response: ServerResponse) => {
					if(response.processed) {
						me.finishCancellationProcess(rsvp);
					} else {

					}
				}, (err) => {
					console.log("Internal error. Something went wrong!");
				});

			}
	    });
	    alert.present();

	}

	finishCancellationProcess(rsvp: Reservation) {
		let alert = this.alertCtrl.create({
	      title: 'Reserva cancelada!',
	      subTitle: 'Su reserva ha sido cancelada!'
	      	+ (rsvp.payment_status == RESERVATIONSTATUS.PROCESSED ? ' Su reembolso será procesado dentro de 48 horas':''),
	      buttons: [
	      {
	      	text: 'OK',
	      	handler: () => {

	      	}
	  	  }]
	    });
	    alert.present();
	    this.viewCtrl.dismiss();
	}

	loadedImg(id: string) {
		this.loadingImgs[id] = true;
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

}
