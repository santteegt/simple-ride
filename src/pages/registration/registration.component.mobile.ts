import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// TODO:
// import { Meteor } from 'meteor-client';
declare var Meteor;
import {MeteorObservable} from "meteor-rxjs";
import {NavController, NavParams, ViewController, ToastController, ModalController, LoadingController} from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';

import { UserRegistration } from "../../classes/user-registration.class";

// import { CarRegistrationMobileComponent } from "./car-registration.component.mobile";
import { TermsOfServiceMobileComponent } from "../terms/terms-service.component.mobile";

// import { UserRecord } from '../../shared/models';
import { CONVERSATIONSTYLES } from '../../shared/models';
import { PoliceRecord } from '../../shared/models/policy.structures';

import { GeolocationService } from "../../classes/services/geolocation.service";
import { Utils } from '../../classes/shared/utils';

@Component({
  selector: 'registration',
  templateUrl: 'registration.component.mobile.html',
  providers: [GeolocationService, Utils]
})
export class UserRegistrationMobileComponent extends UserRegistration implements OnInit, OnDestroy {

	myformGroup: FormGroup;
	submitAttempt: boolean;
	isModal: boolean;

	policeRecord: PoliceRecord;
	validId: boolean;
	lastId: string;
	maxDate: string;

	loader;

	loadingImgs: any;

  conversationStyles: any;

  constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController, private keyboard: Keyboard,
		private formBuilder: FormBuilder, private toastCtrl: ToastController, private modalCtrl: ModalController,
		private loadingCtrl: LoadingController, private geoService: GeolocationService, public utils: Utils) {

		super();
		this.submitAttempt = false;
		this.isModal = navParams.get("isModal");
		this.utils = utils;
		this.loadingImgs = {};
    this.conversationStyles = CONVERSATIONSTYLES.styles;
		this.keyboard.disableScroll(false);
	}

	loadGMapsScript(src: string, callback: any) {
		let element = document.getElementById("googleapi");
		if(element) {
			element.parentNode.removeChild(element);
		}
		let script = document.createElement("script");
		script.type = "text/javascript";
		script.id = "googleapi";
		if(callback) script.onload = callback;
		document.getElementsByTagName("head")[0].appendChild(script);
		script.src = src;
  	}

	ngOnInit() {

		let country, state, city = '';
		if(!this.isModal) {

			this.loader = this.loadingCtrl.create({
			      content: "Cargando...",
			      spinner: "crescent"
			    });
		    this.loader.present();

		    this.loadGMapsScript('https://maps.google.com/maps/api/js?key=AIzaSyA4o5dp21Sdw7vyUO0iC5mua7f9gMx6_2w&libraries=places',
            () => {

				this.geoService.getCurrentGeolocation().then((position) => {

					this.geoService.getCurrentLocation(position).then((data) => {
            console.log(data);
						if(this.myformGroup) {
							this.myformGroup.patchValue({birthCountry: data.country, birthState: data.state, birthCity: data.city});
							this.loader.dismiss();
						}
					});
				}).catch((error) => {
					// JUST FOR TESTING PURPOSES. DELETE ON PRODUCTION
					/*me.myformGroup.patchValue({birthCountry: 'Ecuador', birthState: 'Azuay', birthCity: 'Cuenca'});*/
					this.loader.dismiss();
					console.log('error obtaining geolocation', error);
				});
			});
		}

		let date = new Date();
		date.setFullYear(date.getFullYear() - 18);
    	this.maxDate = this.utils.dateToString(date);

		this.myformGroup = this.formBuilder.group({
		  typeid: [{value: this.person.typeid || '', disabled: this.isModal}, Validators.compose([Validators.required])],
	      dni: [{value: this.person.dni || '', disabled: this.isModal}, Validators.compose([Validators.required])],
	      forename: [this.person.forename, Validators.compose([Validators.required])],
	      surname: [this.person.surname, Validators.compose([Validators.required])],
	      birthday: [this.person.birthday || date.toISOString(), Validators.compose([Validators.required])],
	      birthCountry: [this.person.country || country, Validators.compose([Validators.required])],
	      birthState: [this.person.state || state, Validators.compose([Validators.required])],
	      birthCity: [this.person.city || city, Validators.compose([Validators.required])],
	      email: [this.person.email, Validators.compose([Validators.required])],
	      phone: [this.person.phone || '', Validators.compose([Validators.required])],
        conversation: [this.person.conversation || '', Validators.compose([Validators.required])],
	      isDriver: [this.driverData.status ? true:false],
	      terms: [false]
    	});
	 	// this.myformGroup = new FormGroup({
		 //  typeid: new FormControl({value: this.person.typeid || '', disabled: this.isModal}, Validators.compose([Validators.required])),
	  //     dni: new FormControl({value: this.person.dni || '', disabled: this.isModal}, Validators.compose([Validators.required])),
	  //     forename: new FormControl(this.person.forename, Validators.compose([Validators.required])),
	  //     surname: new FormControl(this.person.surname, Validators.compose([Validators.required])),
	  //     birthday: new FormControl(this.person.birthday || '', Validators.compose([Validators.required])),
	  //     birthCountry: new FormControl(this.person.country || country, Validators.compose([Validators.required])),
	  //     birthState: new FormControl(this.person.state || state, Validators.compose([Validators.required])),
	  //     birthCity: new FormControl(this.person.city || city, Validators.compose([Validators.required])),
	  //     email: new FormControl(this.person.email, Validators.compose([Validators.required])),
	  //     phone: new FormControl(this.person.phone || '', Validators.compose([Validators.required])),
	  //     isDriver: new FormControl(this.driverData.status ? true:false),
	  //     terms: new FormControl(false)
	  //   });

	}

	ngOnDestroy() {

		this.myformGroup.reset();
		this.keyboard.disableScroll(true);
	}

	ionViewWillEnter() {
        this.viewCtrl.showBackButton(false);
    }

    // validateId(event: any) {
    // 	console.log(event.srcElement.value);
    // 	let id = event.srcElement.value;
    // 	if(id.length > 0 && !this.validId) {
    // 		console.log('entra');
	   //  	Meteor.call('getPoliceRecord', Meteor.userId(), id, this.myformGroup.value.typeid == 'passport', function(error, result) {
	   //  		if(!error) {
	   //  			this.validId = true;
	   //  		} else {
	   //  			alert("Internal error while validating your ID");
	   //  		}
	   //  	});



	   //  }

    // }

    validateId(event: any) {
    	let id = this.myformGroup.value.dni;
    	if(id!=null && id.length > 0 && (!this.validId || id != this.lastId) && !this.isModal) {
	    	this.loader = this.loadingCtrl.create({
		      content: "Validando...",
		      spinner: "crescent"
		    });
		    this.lastId = id;
		    this.loader.present();

    		const me = this;
	    	// let rs = Meteor.call('getPoliceRec', Meteor.userId(), id, this.myformGroup.value.typeid == 'passport')
	    	MeteorObservable.call('getPoliceRecord', Meteor.userId(), id, this.myformGroup.value.typeid == 'passport')
	    	.subscribe((response: PoliceRecord) => { // {found: boolean, response: UserRecord}
	    		console.log(response);
	    		this.policeRecord = response;
	    		this.validId = this.policeRecord.found || (!this.policeRecord.found  && this.myformGroup.value.typeid == 'passport')
	    		me.loader.dismiss();

          if(!this.policeRecord.found && this.policeRecord.response.idr == 'error') {
            this.presentToast("Tenemos problemas verificando tú información. Asegurate de haber ingresado correctamente tú número de cédula.");
            this.validId = true;
          }else if(!this.policeRecord.found && this.myformGroup.value.typeid == 'dni') {
	    			this.presentToast("El documento de identificación no es válido");
	    		}
	       }, (err) => {
	       	me.loader.dismiss();
          this.presentToast("Error interno. Por favor intenta de nuevo.");
	       });
	    }

    }

    checkIdValidation() {

    	return this.myformGroup.value.typeid == 'passport' || (!this.policeRecord && this.isModal) || (this.policeRecord.found);

	}

    registerUser() {

    	this.submitAttempt = true;
    	if(this.myformGroup.valid) {
    		if(this.checkIdValidation()) {
          if(!this.isModal){
    		     this.person.typeid = this.myformGroup.value.typeid;
             this.person.dni = this.myformGroup.value.dni;
          }
    		this.person.forename = this.myformGroup.value.forename;
    		this.person.surname = this.myformGroup.value.surname;
    		this.person.birthday = this.myformGroup.value.birthday;
    		this.person.country = this.myformGroup.value.birthCountry;
    		this.person.state = this.myformGroup.value.birthState;
    		this.person.city = this.myformGroup.value.birthCity;
    		this.person.email = this.myformGroup.value.email;
    		this.person.phone = this.myformGroup.value.phone;
      		this.person.conversation = this.myformGroup.value.conversation;
    		this.person.policeRecord = this.policeRecord && this.policeRecord.response.antecedent;
    		this.isDriver = this.myformGroup.value.isDriver;
    		if(!this.isModal) {
    			this.person.isDriver = this.isDriver;
    		}

	    	if(super.registerUser(this.isModal)) {

	    	} else {
          this.presentToast("Error interno. Por favor intenta de nuevo.");
	    	}
	    	//this.navCtrl.push(this.isDriver && !this.isModal ? CarRegistrationMobileComponent:DashboardMobileComponent, {});
	    	return true;
	    } else {
	    	this.validId = false;
	    	this.presentToast("El documento de identificación no es válido");
	    }
	    } else {
	    	this.presentToast("Debes rellenar todos los campos requeridos (*)");
	    }
	    return false;

    }

    loadedImg(id: string) {
		this.loadingImgs[id] = true;
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
		this.viewCtrl.dismiss();
	}

}
