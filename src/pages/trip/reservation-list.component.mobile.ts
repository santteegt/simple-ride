import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Meteor } from 'meteor/meteor';
// import { InjectUser } from "angular2-meteor-accounts-ui";
// import { _ } from 'underscore';
declare var Meteor;
declare var _;
import { NavController, NavParams, ViewController, AlertController,
		LoadingController, PopoverController, ModalController} from 'ionic-angular';
import { Observable, Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs"

import { UserProfileMobileComponent } from '../user/user-profile.component.mobile';

import { TripUtils } from '../../classes/trip-utils.class';

import { UserRating } from '../../shared/models/reservation.structure';
import { Trip, User, Reservation, RESERVATIONSTATUS, MESSAGETYPES } from '../../shared/models';
import { Users, Reservations, ChatMessages} from '../../shared/collections';

interface ServerResponse {
	processed: boolean;
	rs: any;
}

@Component({
  selector: 'reservation-list',
  templateUrl: 'reservation-list.component.mobile.html'
})
// TODO:
// @InjectUser('user')
export class ReservationListMobileComponent implements OnInit, OnDestroy {

	isPushNav: boolean;

	trip: Trip;

	myRSVPSub: Subscription;
	myRSVPObs: Observable<Reservation[]>;

	usersSub: Subscription;
	users: User[];

	userRating: UserRating[];

	tripUtils = TripUtils;

	loader;

	loadingImgs: any;

	user: any;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private alertCtrl: AlertController, private loadingCtrl: LoadingController,
		private modalCtrl: ModalController, private popoverCtrl: PopoverController) {

		this.trip = navParams.get("trip");
		this.isPushNav = navParams.get("isPushNav");

		this.userRating = [];
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

    	if (this.myRSVPSub) {
			this.myRSVPSub.unsubscribe();
		}

		if (this.usersSub) {
			this.usersSub.unsubscribe();
		}

		this.myRSVPSub = MeteorObservable.subscribe('reservations', {}, false).subscribe(() => {

			let reservations = Reservations.find({trip_id: this.trip._id, cancellation_date: undefined});
			reservations.subscribe((data:Reservation[]) => {
				if(data.length == 0){
					// TODO: uncommented gives error on back button action
					// this.navCtrl.pop();
				}
			});
			let rsvpArray = reservations.fetch();
			let users = _.unique(_.map(rsvpArray, function(rsvp: Reservation) {
				return rsvp.user_id;
			}));
			users.push(Meteor.userId());
			this.userRating = this.tripUtils.calculateUsersRating(rsvpArray, false);

			this.usersSub = MeteorObservable.subscribe('user-public-data', users).subscribe(() => {
				this.users = Users.find({_id: {
					$in: users
				}}).fetch();

				this.loader.dismiss();
			});

			this.myRSVPObs = reservations.zone();

		});

	}

	ngOnDestroy() {
		this.myRSVPSub.unsubscribe();
		this.usersSub.unsubscribe();

	}

	getUserRating(user_id: string) {
		if(this.userRating && this.userRating.length > 0) {
			let userRating = _.find(this.userRating, function(userRating: UserRating) {
				return userRating.user_id == user_id;
			});
			return userRating.score;
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

	getUserInfo(user_id: string) {
		return _.find(this.users, function(user: User) {
			return user._id == user_id;
		});

	}

	openUserProfile(user_id: string) {
		let user = _.find(this.users, function(user: User) {
			return user._id == user_id;
		});
		let modal = this.modalCtrl.create(UserProfileMobileComponent, {user_id: user_id, userData: user, isDriver: false});
		modal.present();

	}

	waitingConfirmation(rsvp: Reservation) {
		return rsvp.payment_status == RESERVATIONSTATUS.WAITING_DRIVER_CONFIRMATION;
	}

	confirmReservation(rsvp: Reservation) {
		// let user = this.getUserInfo(rsvp.user_id);
		let alert = this.alertCtrl.create({
	      title: 'Confirmación de Reservación',
	      message: '¿Esta seguro de aprobar la reserva?',
	      buttons: [
					{
		      	text: 'Cerrar',
		      	handler: () => {

		      	}
		  	  },
		      {
		      	text: 'Aceptar',
		      	handler: () => {

		      		this.loader = this.loadingCtrl.create({
				      content: "Cargando...",
				      spinner: "crescent"
				    });
			    	this.loader.present();

		      		MeteorObservable.call('acceptReservation', rsvp).subscribe((response: ServerResponse) => {

		      			this.loader.dismiss();

		      			if(response.processed) {
		      				this.alertFinishedProcess('Reserva Aceptada', 'Gracias por aceptar la reserva');
		      			} else {
		      				this.alertFinishedProcess('Error en el servidor', 'Por favor inténtelo nuevamente');
		      			}
		      		});
		      	}
		  	  }
	  	  ]
	    });
	    alert.present();
	}

	cancelReservation(rsvp: Reservation) {
		let user = this.getUserInfo(rsvp.user_id);
		let alert = this.alertCtrl.create({
	      title: 'Confirmación de Cancelación',
	      message: '¿Esta seguro de cancelar la reserva?',
	      buttons: [
					{
		      	text: 'Cerrar',
		      	handler: () => {

		      	}
		  	  },
		      {
		      	text: 'Cancelar',
		      	handler: () => {
		      		MeteorObservable.call('cancelReservation', rsvp, 1).subscribe((response: ServerResponse) => {
						if(response.processed) {
								this.sendSystemMessage(rsvp.driver_id, rsvp.trip_id, true, 'no aceptó la reserva de ' + user['personData']['forename']);
								this.alertFinishedProcess('Reserva Cancelada', 'La reserva ha sido cancelada exitosamente');
							} else {

							}
						}, (err) => {
							console.log(err);
							console.log("Error interno. Por favor intenta de nuevo.");
						});
		      	}
		  	  }
	  	  ]
	    });
	    alert.present();

	}

	loadedImg(id: string) {
		this.loadingImgs[id] = true;
	}

	alertFinishedProcess(title: string, subtitle: string) {
		let alert = this.alertCtrl.create({
	      title: title,
	      subTitle: subtitle,
	      buttons: [
	      {
	      	text: 'OK',
	      	handler: () => {

	      	}
	  	  }]
	    });
	    alert.present();
	}

	sendSystemMessage(user_id: string, trip_id: string, is_driver: boolean, message: string) {
	  let user = this.getUserInfo(user_id);
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

	dismiss() {
		this.viewCtrl.dismiss();
	}

}
