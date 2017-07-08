import { Component, OnInit, OnDestroy } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor/meteor';
declare var Meteor;
import { NavController, NavParams, ViewController, ModalController, LoadingController } from 'ionic-angular';

import { Observable, Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";

import { CarRecord, UserRecord } from '../../shared/models';
import { CarRecords, UserRecords } from '../../shared/collections';

import { CarRegistrationMobileComponent } from '../registration/car-registration.component.mobile';


@Component({
  selector: 'driver-profile',
  templateUrl: 'driver-profile.component.mobile.html',
})
export class DriverProfileMobileComponent implements OnInit, OnDestroy {

	card: string;

	myCarSub: Subscription;
	myCarOb: Observable<CarRecord[]>;

	myUserRecordSub: Subscription;
	myUserRecordOb: Observable<UserRecord[]>;

	loader;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private modalCtrl: ModalController, private loadingCtrl: LoadingController) {

		this.card = "Matricula";
	}

	ngOnInit() {

		this.loader = this.loadingCtrl.create({
	      content: "Cargando...",
	      spinner: "crescent"
	    });
	    this.loader.present();


		if (this.myCarSub) {
        	this.myCarSub.unsubscribe();
      	}

      	if (this.myUserRecordSub) {
        	this.myUserRecordSub.unsubscribe();
      	}

    	this.myCarSub = MeteorObservable.subscribe('car-record').subscribe(() => {
        	this.myCarOb = CarRecords.find({}).zone();
        	this.loader.dismiss();
      	});

      	this.myUserRecordSub = MeteorObservable.subscribe('user-record').subscribe(() => {
        	this.myUserRecordOb = UserRecords.find({}).zone();
      	});


	}

	ngOnDestroy() {
		this.myCarSub.unsubscribe();
		this.myUserRecordSub.unsubscribe();

	}

	editCarRegistration() {
		let modal = this.modalCtrl.create(CarRegistrationMobileComponent, {isModal: true});
		modal.present();

	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

}
