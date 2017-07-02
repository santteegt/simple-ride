import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
// TODO:
// import { Meteor } from 'meteor-client';
declare var Meteor;
import {NavController, NavParams, ViewController, ToastController,
	ModalController, LoadingController, AlertController, App} from 'ionic-angular';

import {MeteorObservable} from "meteor-rxjs";

import { UserRegistration } from "../../classes/user-registration.class";
import { Utils } from '../../classes/shared/utils';

// TODO: Migrate components
// import { DashboardMobileComponent } from "../../dashboard.component.mobile";
import { TermsOfServiceMobileComponent } from "../terms/terms-service.component.mobile";

import { CarRecord } from '../../shared/models/policy.structures';
import { LicenseRecord } from '../../shared/models/policy.structures';
import { Users } from "../../shared/collections";

@Component({
  selector: 'car-registration',
  templateUrl: 'car-registration.component.mobile.html',
  providers: [Utils]
})
export class CarRegistrationMobileComponent extends UserRegistration implements OnInit, OnDestroy {

	myformGroup: FormGroup;
	submitAttempt: boolean;
	isModal: boolean;

	terms: boolean;
	carRegister: string;
	lastRegister: string;
	validRegister: boolean;

	licenseRegister: string;
	hasLicense: boolean;

	loader;
	card: string;

	carRecord: CarRecord;
	licenseRecord: LicenseRecord;

	updated: boolean;

	hasInsurance: boolean;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private formBuilder: FormBuilder, private toastCtrl: ToastController, private modalCtrl: ModalController,
		private loadingCtrl: LoadingController, private alertCtrl: AlertController, private utils: Utils, private app: App) {
		super();
		this.card = "Matricula";
		this.submitAttempt = false;
		this.isModal = navParams.get("isModal");
		this.utils = utils;
		this.updated = false;
		this.hasLicense = false;
		this.validRegister = false;
	}

	ngOnInit() {
		this.validateLicence();

		// this.myformGroup = this.formBuilder.group({
	 //      carBrand: [this.driverData.carBrand || '', Validators.compose([Validators.required])],
	 //      carColor: [this.driverData.carColor || '', Validators.compose([Validators.required])],
	 //      carRegister: [this.driverData.carRegister || '', Validators.compose([Validators.required])],
	 //      noDoors: [this.driverData.noDoors || '', Validators.compose([Validators.required])],
	 //      terms: [false]
	 //    });

	}

	ngOnDestroy() {
		if(this.isModal && this.updated) {
			this.showAlert('Perfil actualizado', 'El vehículo ha sido registrado exitosamente!');
		}
	}

	ionViewWillEnter() {
        this.viewCtrl.showBackButton(false);
    }

    validateCar() {

    	// let person_id = Meteor.user()['personData']['dni'];	

    	if(this.carRegister!=null && this.carRegister.length > 0 && (!this.validRegister || this.carRegister != this.lastRegister)) {
	    	this.loader = this.loadingCtrl.create({
		      content: "Validando...",
		      spinner: "crescent"
		    });
			if(this.carRegister.length == 6){
					this.carRegister = this.carRegister.substring(0,3)+"0"+this.carRegister.substring(3);
			}
			this.lastRegister = this.carRegister;
		    this.loader.present();

    		const me = this;

	    	MeteorObservable.call('crawlANTCarData', Meteor.userId(), this.carRegister)
	    	.subscribe((response: CarRecord) => {
	    		me.carRecord = response;
	    		me.validRegister = this.carRecord.found;

	    		if(!me.validRegister) {
	    			me.loader.dismiss();
	    			me.presentToast("El número de placa no es válido");
	    		}else if(this.utils.stringToDate(me.carRecord.vehicleData.fcaducidad_matricula) < new Date()){
					me.loader.dismiss();
					me.presentToast("La matrícula de este vehículo expiro");
					me.validRegister = false;
				} else {
					me.loader.dismiss();
					// MeteorObservable.call('crawlANTPersonData', Meteor.userId(), person_id)
					// .subscribe((response: LicenseRecord) => {
					// 	console.log(response);
					// 	me.licenseRecord = response;
					// 	me.hasLicense = response.found;
					// 	me.loader.dismiss();
					// 	if(!me.hasLicense || me.licenseRecord.license_info.points === "0") {
					// 		me.presentToast("Usted no registra una licencia válida");
					// 	}else if(this.utils.stringToDate(me.licenseRecord.license_info.license_expire) < new Date()){
					// 		me.presentToast("Su licencia expiro");
					// 		me.hasLicense = false;
					// 	}

					// }, (err) => {
				 //    	me.loader.dismiss();
				 //       	me.presentToast("Internal error. Something went wrong!");
			  //       });
				}

	       }, (err) => {
	       	me.loader.dismiss();
	       	me.presentToast("Internal error. Something went wrong!");
	       });
	    }

    }

    validateLicence(){

    	let person_id = Meteor.user()['personData']['dni'];
    	const me = this;

    	MeteorObservable.call('crawlANTPersonData', Meteor.userId(), person_id)
		.subscribe((response: LicenseRecord) => {
			me.licenseRecord = response;
			me.hasLicense = response.found;
			if(!me.hasLicense || me.licenseRecord.license_info.points === "0") {
				me.showAlert('Licencia no válida','Usted no registra una licencia válida');
				me.hasLicense = false;
			} else if(this.utils.stringToDate(me.licenseRecord.license_info.license_expire) < new Date()){
				me.showAlert('Licencia no válida','Su licencia ha caducado');
				me.hasLicense = false;
			}
		}, (err) => {
	       	me.presentToast('Internal error. Something went wrong!');
        });
    }

    registerCar() {
    	this.submitAttempt = true;

    	// if(this.myformGroup.valid) {
    	// 	this.driverData.carBrand = this.myformGroup.value.carBrand;
    	// 	this.driverData.carColor = this.myformGroup.value.carColor;
    	// 	this.driverData.carRegister = this.myformGroup.value.carRegister;
    	// 	this.driverData.noDoors = this.myformGroup.value.noDoors;
	    // 	if(super.registerCar()) {

	    // 	} else {
	    // 		alert("Something went wrong!");
	    // 	}
	    // 	this.navCtrl.push(DashboardMobileComponent, {
	    // 	});
	    // 	return true;
	    // } else {
	    // 	this.presentToast("Debes rellenar todos los campos requeridos (*)");
	    // }
	    // return false;
	    this.driverData.carBrand = this.carRecord.vehicleData.marca + " " + this.carRecord.vehicleData.modelo;
			this.driverData.carColor = this.carRecord.vehicleData.color;
			this.driverData.carRegister = this.lastRegister;
			this.driverData.hasInsurance = this.hasInsurance;
    	if(!super.registerCar()) {
    		this.presentToast("Internal error. Something went wrong!");
    		return false;
    	}
    	this.updated = true;
    	if(this.isModal) {
    		this.dismiss();
    	} else {
	    	// this.navCtrl.push(DashboardMobileComponent, {});
	    }
    	return this.updated;

    }

    skipStep() {
		Users.update({'_id': Meteor.userId()}, {$set: {
			'personData.isDriver': false ,
			'driverData': {}}
		});
		// TODO: Migrate component
		// this.navCtrl.push(DashboardMobileComponent, {});
    }

    presentToast(message: string) {
		let toast = this.toastCtrl.create({
		  message: message,
		  position: 'top',
		  duration: 3000
		});
		toast.present();
	}

	termsOfService() {
		let modal = this.modalCtrl.create(TermsOfServiceMobileComponent);
    	modal.present();
	}

	dismiss() {
		this.viewCtrl.dismiss({valid_driver: this.hasLicense && this.validRegister});
	}

	showAlert(title: string, subtitle: string) {
		let alert = this.alertCtrl.create({
	      title: title,
	      subTitle: subtitle,
	      buttons: ['OK']
	    });
	    alert.present();
	}
}
