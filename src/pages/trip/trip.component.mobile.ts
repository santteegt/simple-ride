import { Component, OnInit, OnDestroy } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor/meteor';
// import { Counts } from 'meteor/tmeasday:publish-counts';
// import { InjectUser } from "angular2-meteor-accounts-ui";
declare var Meteor;
import { NavController, NavParams, ViewController, AlertController, LoadingController, ModalController } from 'ionic-angular';
import { Observable, Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs"

import { TripUtils } from '../../classes/trip-utils.class';
import { IsDriverPipe } from '../../classes/shared/is-driver.pipe';
import { TripMessageBoardMobileComponent } from './trip-message-board.component.mobile';
import { ReservationListMobileComponent } from './reservation-list.component.mobile';

import { Trip, DELETIONREASONS } from '../../shared/models';

interface ServerResponse {
	processed: boolean;
	result: any;
}

@Component({
  selector: 'trip',
  templateUrl: 'trip.component.mobile.html',
  providers: [IsDriverPipe]
})
// TODO:
// @InjectUser('user')
export class TripMobileComponent implements OnInit, OnDestroy {

	trip: Trip;
	readOnly: boolean;
	isPushNav: boolean;
	reservationsCount: number;

	tripUtils = TripUtils;

	messageBoardModal: Component;
	rsvpListModal: Component;

	myRSVPSub: Subscription;
	autorunSub: Subscription;

	user: any;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private alertCtrl: AlertController, private loadingCtrl: LoadingController,
		private modalCtrl: ModalController, private isDriverPipe: IsDriverPipe) {

		this.trip = navParams.get("trip");

		this.readOnly = navParams.get("readOnly");
		this.isPushNav = navParams.get("isPushNav");

		this.messageBoardModal = TripMessageBoardMobileComponent;
		this.rsvpListModal = ReservationListMobileComponent;

	}

	ngOnInit() {

		MeteorObservable.autorun().subscribe(() => {
      this.user = Meteor.user();
    });

		if(this.autorunSub) {
			this.autorunSub.unsubscribe();
		}
		if(this.myRSVPSub) {
			this.myRSVPSub.unsubscribe();
		}
		// TODO: migrate Counts
		// this.myRSVPSub = MeteorObservable.subscribe('reservations', {}, false, null, this.trip._id).subscribe(() => {
	  //     this.autorunSub = MeteorObservable.autorun().subscribe(() => {
	  //       this.reservationsCount = Counts.get('reservationsCount');
	  //     });
	  //   });
	}

	ngOnDestroy() {
		// TODO: migrate Counts
		// this.autorunSub.unsubscribe();
		// this.myRSVPSub.unsubscribe();
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	deleteTrip() {
		const me = this;
		let confirm = this.alertCtrl.create({
			title: 'Cancelar Viaje',
			message: '¿Está seguro que desea cancelar este viaje?',
			buttons: [
			{
			  text: 'No',
			  handler: () => {
			  }
			},
			{
			  text: 'Si',
			  handler: () => {
			  	me.getTripDeleteReasons();

			  }
			}]
		});
		confirm.present();
	}

	getTripDeleteReasons() {
		const me = this;
		let alert = this.alertCtrl.create();
	    alert.setTitle('¿Por qué cancelas tu viaje?');

	    let first: boolean = true;
	    for(let i=0; i < DELETIONREASONS.reasons.length; i++) {
	    	alert.addInput({
		      type: 'radio',
		      label: DELETIONREASONS.reasons[i],
		      value: i.toString(),
		      checked: first
		    });
		    first = false;
	    }



	    alert.addButton('Cancelar');
	    alert.addButton({
	      text: 'Confirmar',
	      handler: data => {
	      	MeteorObservable.call('deleteTrip', this.trip, parseInt(data)).subscribe((response: ServerResponse) => {
	      		if(response.processed) {
	      			me.finishDeletionProcess();
	      		} else {

	      		}
	      	});
	    //     Meteor.call('deleteTrip', this.trip, parseInt(data), function(error, result) {
		  	// 	if(!error) {
		  	// 		console.log(result);
		  	// 		me.finishDeletionProcess();
		  	// 	} else {

		  	// 	}
		  	// });
	      }
	    });
	    alert.present();

	}

	finishDeletionProcess() {
		let alert = this.alertCtrl.create({
	      title: 'Viaje  cancelado!',
	      subTitle: 'Tu viaje ha sido elminado!',
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

	openModal(component: Component, params: Object) {
		let modal = this.modalCtrl.create(component, params);
		modal.present();
	}

	navigateTo(component: any, params: Object) {
		this.navCtrl.push(component, params);
	}

}
