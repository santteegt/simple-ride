import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Meteor } from 'meteor/meteor';
declare var Meteor;
import { NavController, NavParams, ViewController, AlertController,
		LoadingController, ToastController, ModalController, App } from 'ionic-angular';
import { Observable, Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs"

import { TripUtils } from '../../classes/trip-utils.class';
import { TermsOfServiceMobileComponent } from "../terms/terms-service.component.mobile";
import { UserRegistrationMobileComponent } from '../registration/registration.component.mobile';

import { Trip, Reservation, RESERVATIONSTATUS } from '../../shared/models';
import { Trips } from '../../shared/collections';

import { IsUserIncompletePipe } from '../../classes/shared/is-user-incomplete.pipe';

interface ServerResponse {
	status: number;
	message: string;
}

interface PromoResponse {
	valid: boolean;
	discountPercentage?: number;
}

@Component({
  selector: 'checkout',
  templateUrl: 'checkout.component.mobile.html',
  providers: [IsUserIncompletePipe]
})
export class CheckoutMobileComponent implements OnInit, OnDestroy {

	trip_id: string;

	myTripsSub: Subscription;
	trips: Observable<Trip[]>;

	tripUtils = TripUtils;

	last_available_sits: number;
	reservedSits: number;

	comments: string;
	paymentMethod: string;
	totalPayment: number;
	terms: boolean;

	loader;

	travelPin: string;
	pinMessage: string;
	validPin: boolean;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private alertCtrl: AlertController, private loadingCtrl: LoadingController, private appCtrl: App,
		private toastCtrl: ToastController, private modalCtrl: ModalController,
		private isUserIncomplete: IsUserIncompletePipe) {

		this.trip_id = navParams.get("trip_id");
		this.reservedSits = 1;
		this.paymentMethod = "pin";
		this.terms = false;

		this.travelPin = "";
		this.pinMessage = "";
		this.validPin = false;

	}

	ngOnInit() {

		if (this.myTripsSub) {
			this.myTripsSub.unsubscribe();
		}

		this.myTripsSub = MeteorObservable.subscribe('trips', {}, true).subscribe(() => {

			let trips = Trips.find({
				'_id': this.trip_id,
				cancellation_reason: undefined
			});

			let trip = trips.fetch()[0];
			this.last_available_sits = !this.last_available_sits ? trip.available_places:this.last_available_sits;
			if(this.last_available_sits > trip.available_places) {
				let diff = this.last_available_sits - trip.available_places;

				this.presentToast("¡ALERTA! " + diff + (diff == 1 ? " lugar ha ":" lugares han ") + "sido reservado"
					+ (diff == 1 ? " ":"s ") + "en este momento");

			} else {
				this.totalPayment = trip.price * this.reservedSits;
			}
			this.last_available_sits = trip.available_places;

			this.trips = trips.zone();
		});

	}

	ngOnDestroy() {
		this.myTripsSub.unsubscribe();

	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	addSit(trip: Trip) {
		if(this.reservedSits < this.last_available_sits) {
			this.reservedSits += 1;
			this.totalPayment = trip.price * this.reservedSits;
		}

	}

	removeSit(trip: Trip) {
		if(this.reservedSits >= 2) {
			this.reservedSits -= 1;
			this.totalPayment = trip.price * this.reservedSits;
		}

	}

	joinTrip(trip: Trip) {

		if(this.isUserIncomplete.transform(Meteor.user())) {
			let alert = this.alertCtrl.create({
				'title': 'Pérfil Incompleto',
				'subTitle': 'Tu pérfil está incompleto. Por favor completa los campos de identificación y teléfono en tu perfil para continuar.',
				buttons: [
					{
						text: 'Cerrar',
						handler: () => {
						}
					},
					{
						text: 'Ver Perfil',
						handler: () => {
							let modal = this.modalCtrl.create(UserRegistrationMobileComponent, {'isModal': true});
							modal.present();
						}
					}]
				});
			alert.present();

		} else {

			this.loader = this.loadingCtrl.create({
			  content: "Procesando reserva...",
			  spinner: "crescent"
			});
			this.loader.present();
			let payment_status = trip.rsvp_method == "1" ? RESERVATIONSTATUS.WAITING_DRIVER_CONFIRMATION:
				(this.paymentMethod == "pin" ? RESERVATIONSTATUS.PROCESSED:
					(this.paymentMethod == "deposit" ? 
						RESERVATIONSTATUS.WAITING_USER_ACTION:RESERVATIONSTATUS.PROCESSING_PAYMENT)
				);
			let reservation: Reservation = {
				trip_id: trip._id,
				driver_id: trip.driver_id,
				user_id: Meteor.userId(),
				departure_date: trip.departureDate,
				reservation_date: new Date(),
				places: this.reservedSits,
				comments: this.comments,
				payment_method: this.paymentMethod,
				payment_status: payment_status,
				total: this.totalPayment,
				origin: trip.origin.shortName,
				destination: trip.destination.shortName,
			}

			MeteorObservable.call('joinTrip', reservation).subscribe((response: ServerResponse) => {
				this.loader.dismiss();
				switch (response.status) {
					case 200:


						let addemdum = this.getAddemdumMessage(reservation);
						this.presentAlert('Reserva', "Su reserva ha sido registrada correctamente." + addemdum);
						this.viewCtrl.dismiss({close: true});
						break;
					default:
						this.presentAlert('Error al procesar su reserva', response.message);
						break;
				}
	    	}, (err) => {
	    		this.loader.dismiss();
					this.presentToast("Error interno. Por favor intenta de nuevo.");
	     	});

		}

	}

	getAddemdumMessage(rsvp: Reservation) {
		
		let message: string = "";

		switch (rsvp.payment_status) {
			case RESERVATIONSTATUS.WAITING_DRIVER_CONFIRMATION:
				message = " El conductor tiene que aprobar su solicitud."
				message += this.paymentMethod == 'deposit' ? 
				" Una vez aprobada recuerde subir el registro de su pago en el menú Mis Viajes":""
				break;

			case RESERVATIONSTATUS.WAITING_USER_ACTION:
				message += " Recuerde subir el registro de su pago en el menú Mis Viajes en menos de 24 horas";
			
			default:
				// code...
				break;
		}

		return message;
	}


	presentToast(message: string) {
		let toast = this.toastCtrl.create({
		  message: message,
		  position: 'top',
		  duration: 5000
		});
		toast.present();
	}

	presentAlert(title: string, message: string, popWhenOK?: boolean) {
		let alert = this.alertCtrl.create({
	      'title': title,
	      'subTitle': message,
	      buttons: [
	      {
	      	text: 'OK',
	      	handler: () => {
	      		if(popWhenOK) {
	      			this.appCtrl.getRootNav().pop();
	      		}

	      	}
	  	  }]
	    });
	    alert.present();
	}

	termsOfService() {
		let modal = this.modalCtrl.create(TermsOfServiceMobileComponent);
  		modal.present();
	}

	sendPinCode() {

		this.loader = this.loadingCtrl.create({
		  content: "Validando PIN...",
		  spinner: "crescent"
		});

		MeteorObservable.call('validatePin', this.travelPin).subscribe((response: PromoResponse) => {
			this.loader.dismiss();

			this.validPin = response.valid;

			this.pinMessage = this.validPin ? "Código valido! Disfruta de tu viaje":"Error! PIN inválido";

    	}, (err) => {
    		this.loader.dismiss();
			this.presentToast("Error interno. Por favor intentelo de nuevo.");
     	});
		
		

	}

}
