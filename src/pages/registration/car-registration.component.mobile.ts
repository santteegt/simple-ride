import { Component, OnInit, OnDestroy } from '@angular/core';
import { HTTP } from '@ionic-native/http';
// TODO:
// import { Meteor } from 'meteor-client';
declare var Meteor;
declare var cheerio;
import {NavController, NavParams, ViewController, ModalController, LoadingController} from 'ionic-angular';

import {MeteorObservable} from "meteor-rxjs";

import { UserRegistration } from "../../classes/user-registration.class";
import { UIUtilsService } from "../../classes/services/ui-utils.service";
import { Utils } from '../../classes/shared/utils';

import { DashboardMobileComponent } from "../dashboard/dashboard.component.mobile";
import { TermsOfServiceMobileComponent } from "../terms/terms-service.component.mobile";

import { CarRecord } from '../../shared/models/policy.structures';
import { LicenseRecord } from '../../shared/models/policy.structures';
import { Users } from "../../shared/collections";

@Component({
  selector: 'car-registration',
  templateUrl: 'car-registration.component.mobile.html',
  providers: [UIUtilsService, Utils]
})
export class CarRegistrationMobileComponent extends UserRegistration implements OnInit, OnDestroy {
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

	queried: boolean;
	updated: boolean;

	hasInsurance: boolean;


	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private uiUtils: UIUtilsService, private modalCtrl: ModalController,
		private loadingCtrl: LoadingController, private utils: Utils, private http: HTTP) {
		super();
		this.card = "Matricula";
		this.submitAttempt = false;
		this.isModal = navParams.get("isModal");
		this.utils = utils;
		this.queried = false;
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
			this.uiUtils.presentAlert('Perfil actualizado', '¡Su perfil ha sido actualizado exitosamente!');
		}
	}

	ionViewWillEnter() {
        this.viewCtrl.showBackButton(false);
    }

    validateCar() {

    	if(this.uiUtils.toastInstance) {
    		this.uiUtils.toastInstance.dismiss();
    	}

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

            MeteorObservable.call('getANTURL', 'PLA', this.carRegister)
            .subscribe((response: any) => {

                try {
                    this.http.acceptAllCerts(true);
                    this.http.get(response.url, {}, {}).then(res => {

                        MeteorObservable.call('parseANTCarData', Meteor.userId(), this.carRegister, res.data)
                        .subscribe((response: CarRecord) => {
                            this.queried = true;
                            me.carRecord = response;
                            me.validRegister = this.carRecord.found;
                            if(!me.validRegister) {
                                me.loader.dismiss();
                                this.uiUtils.presentToast("El número de placa no es válido", 'toast-error', true, 'Cerrar');
                            }else if(this.utils.stringToDate(me.carRecord.vehicleData.fcaducidad_matricula) < new Date()){
                                me.loader.dismiss();
                                this.uiUtils.presentToast("La matrícula de este vehículo expiro", 'toast-error', true, 'Cerrar');
                                me.validRegister = false;
                            } else {
                                this.uiUtils.presentToast("¡El vehículo ha sido registrado exitosamente!", 'toast-ok', false, undefined, 3000);
                                me.loader.dismiss();
                            }

                        }, (err) => {
                                me.loader.dismiss();
                                this.uiUtils.presentToast("Error interno. Por favor intenta de nuevo.", 'toast-error', false, undefined, 3000);
                        });
                    }).catch(error => {
                        me.loader.dismiss();
                        this.uiUtils.presentToast("Error interno. Por favor intenta de nuevo.", 'toast-error', false, undefined, 3000);
                    });
                } catch (e) {
                    me.loader.dismiss();
                    this.uiUtils.presentToast("Error interno. Por favor intenta de nuevo.", 'toast-error', false, undefined, 3000);
                }
                me.loader.dismiss();
            }, (err) => {
                me.loader.dismiss();
            });

            /*
            MeteorObservable.call('crawlANTCarData', Meteor.userId(), this.carRegister)
	    	.subscribe((response: CarRecord) => {
	    		this.queried = true;
	    		me.carRecord = response;
	    		me.validRegister = this.carRecord.found;

	    		if(!me.validRegister) {
	    			me.loader.dismiss();
	    			this.uiUtils.presentToast("El número de placa no es válido", 'toast-error', true, 'Cerrar');
	    		}else if(this.utils.stringToDate(me.carRecord.vehicleData.fcaducidad_matricula) < new Date()){
					me.loader.dismiss();
					this.uiUtils.presentToast("La matrícula de este vehículo expiro", 'toast-error', true, 'Cerrar');
					me.validRegister = false;
				} else {
					this.uiUtils.presentToast("¡El vehículo ha sido registrado exitosamente!", 'toast-ok', false, undefined, 3000);
					me.loader.dismiss();
				}

	       }, (err) => {
	       	me.loader.dismiss();
				this.uiUtils.presentToast("Error interno. Por favor intenta de nuevo.", 'toast-error', false, undefined, 3000);
	       });
           */

	    }

    }

    validateLicence() {

    	let person_id = Meteor.user()['personData']['dni'];
    	const me = this;

    	this.loader = this.loadingCtrl.create({
	      content: "Buscando licencia de conducir...",
	      spinner: "crescent"
	    });

	    this.loader.present();

        MeteorObservable.call('getANTURL', 'CED', person_id)
        .subscribe((response: any) => {

            try {
                this.http.acceptAllCerts(true);
                this.http.get(response.url, {}, {}).then(res => {
                    MeteorObservable.call('parseANTPersonData', Meteor.userId(), person_id, res.data)
                    .subscribe((response: LicenseRecord) => {
                        me.licenseRecord = response;
                        me.hasLicense = response.found;
                        let prevMonth = new Date();
                        prevMonth.setDate(prevMonth.getDate() - 30);
                        this.loader.dismiss();
                        if(!me.hasLicense && !me.licenseRecord.license_info) {
                            this.uiUtils.presentToast("Error interno al tratar de encontrar tu licencia. Por favor intentalo más tarde", 'toast-error', true, 'Cerrar');
                            this.viewCtrl.dismiss({valid_driver: this.updated && this.hasLicense && this.validRegister});
                        } else if(me.licenseRecord.license_info.points === "0") {
                            this.uiUtils.presentAlert('Licencia no válida','Usted no registra una licencia válida de circulación en el País donde se encuentra');
                            if(this.isModal) {
                                this.viewCtrl.dismiss({valid_driver: this.updated && this.hasLicense && this.validRegister});
                            }
                            me.hasLicense = false;
                        } else if(this.utils.stringToDate(me.licenseRecord.license_info.license_expire) < prevMonth){
                            this.uiUtils.presentAlert('Licencia no válida','Su licencia ha caducado');
                            if(this.isModal) {
                                this.viewCtrl.dismiss({valid_driver: this.updated && this.hasLicense && this.validRegister});
                            }
                            me.hasLicense = false;
                        }
                    }, (err) => {
                        this.loader.dismiss();
                        this.uiUtils.presentToast("Error interno. Por favor intenta de nuevo.", 'toast-error', true, 'Cerrar');
                    });
                }).catch(error => {
                    me.loader.dismiss();
                    console.log(error);
                });
            } catch (e) {
                me.loader.dismiss();
                console.log(e);
            }
            me.loader.dismiss();
        }, (err) => {
            me.loader.dismiss();
        });

        /*MeteorObservable.call('crawlANTPersonData', Meteor.userId(), person_id)
			.subscribe((response: LicenseRecord) => {
				me.licenseRecord = response;
				me.hasLicense = response.found;
				let prevMonth = new Date();
				prevMonth.setDate(prevMonth.getDate() - 30);
				this.loader.dismiss();
				if(!me.hasLicense && !me.licenseRecord.license_info) { //TODO: Manage ANT service crashes
					this.uiUtils.presentToast("Error interno al tratar de encontrar tu licencia. Por favor intentalo más tarde", 'toast-error', true, 'Cerrar');
					this.viewCtrl.dismiss({valid_driver: this.updated && this.hasLicense && this.validRegister});
				} else if(me.licenseRecord.license_info.points === "0") {
					this.uiUtils.presentAlert('Licencia no válida','Usted no registra una licencia válida de circulación en el País donde se encuentra');
					if(this.isModal) {
						this.viewCtrl.dismiss({valid_driver: this.updated && this.hasLicense && this.validRegister});
					}
					me.hasLicense = false;
				} else if(this.utils.stringToDate(me.licenseRecord.license_info.license_expire) < prevMonth){
					this.uiUtils.presentAlert('Licencia no válida','Su licencia ha caducado');
					if(this.isModal) {
						this.viewCtrl.dismiss({valid_driver: this.updated && this.hasLicense && this.validRegister});
					}
					me.hasLicense = false;
				}
			}, (err) => {
				this.loader.dismiss();
				this.uiUtils.presentToast("Error interno. Por favor intenta de nuevo.", 'toast-error', true, 'Cerrar');
	    });*/
    }

    registerCar() {

    	if(this.uiUtils.toastInstance) {
    		this.uiUtils.toastInstance.dismiss();
    	}

    	this.submitAttempt = true;

	    this.driverData.carBrand = this.carRecord.vehicleData.marca + " " + this.carRecord.vehicleData.modelo;
		this.driverData.carColor = this.carRecord.vehicleData.color;
		this.driverData.carRegister = this.lastRegister;
		this.driverData.hasInsurance = this.hasInsurance;
    	if(!super.registerCar()) {
    		this.uiUtils.presentToast("Error interno. Por favor intenta de nuevo.", 'toast-error', false, undefined, 3000);
    		return false;
    	}
        MeteorObservable.call('changeUserDocumentStatus', Meteor.userId(), 3, false).subscribe((rs) => {});
    	this.updated = true;
    	if(this.isModal) {
    		this.dismiss();
    	} else {
	    	this.navCtrl.push(DashboardMobileComponent, {});
	    }
    	return this.updated;

    }

    skipStep() {

    	if(this.uiUtils.toastInstance) {
    		this.uiUtils.toastInstance.dismiss();
    	}

		Users.update({'_id': Meteor.userId()}, {$set: {
			'personData.isDriver': false ,
			'driverData': {}}
		});
		this.navCtrl.push(DashboardMobileComponent, {});
    }

	termsOfService() {

		if(this.uiUtils.toastInstance) {
    		this.uiUtils.toastInstance.dismiss();
    	}

		let modal = this.modalCtrl.create(TermsOfServiceMobileComponent);
    	modal.present();
	}

	dismiss() {

		if(this.uiUtils.toastInstance) {
    		this.uiUtils.toastInstance.dismiss();
    	}
    	if(this.queried && this.validRegister && !this.updated) {
    		this.uiUtils.presentAlert('Perfil incompleto','Es necesario que acepte los términos y condiciones para continuar');
    	} else {
            this.viewCtrl.dismiss({valid_driver: this.updated && this.hasLicense && this.validRegister});
    	}


	}

    fixLabel(label: string) {
        let newLabel = ''
        switch (label) {
            case "A&#xF1;o de Matr&#xED;cul":
                newLabel = 'anio_matricula'
                break;
            case "Fecha de Matr&#xED;cula":
                newLabel = 'fecha_matricula';
                break;
            case "A&#xF1;o":
                newLabel = 'anio';
                break;
            case "Fecha de Caducidad":
                newLabel = 'fcaducidad_matricula';
                break;
            default:
                newLabel = label.toLowerCase();
                break;
        }
        return newLabel;
    }

}
