import { Injectable } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor-client';
declare var Meteor;
import { AlertController, ToastController } from 'ionic-angular';

// TODO:
// import { _ } from 'meteor/underscore';
declare var _;

@Injectable()
export class UIUtilsService {

	public toastInstance: any;

	constructor(private toastCtrl: ToastController, private alertCtrl: AlertController) {

	}

	presentToast(message: string, cssClass?: string, closeButton?: boolean, closeButtonText?: string, 
    	duration?: number) {

    	let toastProperties = {
    		message: message,
		  	position: 'top',
		  	showCloseButton: closeButton,
		  	dismissOnPageChange: true
    	};
    	if(duration) {
    		toastProperties['duration'] = duration;
    	}
    	if(cssClass) {
    		 toastProperties['cssClass'] = cssClass;
    	}
    	if(closeButtonText) {
    		toastProperties['closeButtonText'] = closeButtonText;	
    	}
		this.toastInstance = this.toastCtrl.create(toastProperties);
		this.toastInstance.present();
	}

	presentAlert(title: string, message: string) {
		let alert = this.alertCtrl.create({
			'title': title,
			'subTitle': message,
			buttons: [{
				text: 'OK'
			}]
		});
		alert.present();
	}
}