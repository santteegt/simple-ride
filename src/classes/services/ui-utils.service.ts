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

	validateId(dni: string){
		let region: number, last_digit: number, even: number;
		let number1: number, number3: number, number5: number, number7: number, number9: number;
		let odd: number, total: number, first_digit_sum: number, ten: number, validator: number;
		if(dni.length == 10){
			region = parseInt(dni.substring(0,2));
			if( region >= 1 && region <=24 ){
				last_digit   = parseInt(dni.substring(9,10));

				even = parseInt(dni.substring(1,2)) + parseInt(dni.substring(3,4)) + parseInt(dni.substring(5,6)) + parseInt(dni.substring(7,8));

				number1 = parseInt(dni.substring(0,1));
				number1 = (number1 * 2);
				if( number1 > 9 ){ number1 = (number1 - 9); }

				number3 = parseInt(dni.substring(2,3));
				number3 = (number3 * 2);
				if( number3 > 9 ){ number3 = (number3 - 9); }

				number5 = parseInt(dni.substring(4,5));
				number5 = (number5 * 2);
				if( number5 > 9 ){ number5 = (number5 - 9); }

				number7 = parseInt(dni.substring(6,7));
				number7 = (number7 * 2);
				if( number7 > 9 ){ number7 = (number7 - 9); }

				number9 = parseInt(dni.substring(8,9));
				number9 = (number9 * 2);
				if( number9 > 9 ){ number9 = (number9 - 9); }

				odd = number1 + number3 + number5 + number7 + number9;

				total = (even + odd);

				first_digit_sum = parseInt(String(total).substring(0,1));

				ten = (first_digit_sum + 1)  * 10;

				validator = ten - total;

				if(validator == 10) validator = 0;

				if(validator == last_digit){
					return true;
				}else{
					return false;
				}
			}else{
				return false;
			}
		}else{
			return false;
        }
	}
}
