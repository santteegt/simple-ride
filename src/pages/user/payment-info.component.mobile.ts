import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// TODO:
// import { Meteor } from 'meteor/meteor';
// import { InjectUser } from "angular2-meteor-accounts-ui";
// import { _ } from 'underscore';
declare var Meteor;
declare var _;
import { NavParams, ViewController, ToastController } from 'ionic-angular';

import { MeteorObservable } from "meteor-rxjs";

import { IsDriverPipe } from '../../classes/shared/is-driver.pipe';

import { PaymentInfo } from '../../shared/models';


@Component({
  selector: 'payment-info',
  templateUrl: 'payment-info.component.mobile.html',
  providers: [IsDriverPipe]
})
// TODO:
// @InjectUser('user')

export class PaymentInfoMobileComponent implements OnInit, OnDestroy {

	myformGroup: FormGroup;

	submitAttempt: boolean;
	edit: boolean;

	user_id: string;

	paymentInfo: PaymentInfo;

  user: any;

	constructor(private navParams: NavParams, private viewCtrl: ViewController, private formBuilder: FormBuilder,
		private toastCtrl: ToastController, private isDriverPipe: IsDriverPipe) {
		this.paymentInfo = Meteor.user()["paymentInfo"];
		this.edit = false;
		if(!this.paymentInfo){
			this.edit = true;
		}
	}

	ngOnInit() {

    MeteorObservable.autorun().subscribe(() => {
      this.user = Meteor.user();
    });

		this.myformGroup = this.formBuilder.group({
		  bankname: [this.paymentInfo.bankname || '', Validators.compose([Validators.required])],
	      accounttype: [this.paymentInfo.accounttype || '', Validators.compose([Validators.required])],
	      accountname: [this.paymentInfo.accountname || '', Validators.compose([Validators.required])],
	      accountnumber: [this.paymentInfo.accountnumber || '', Validators.compose([Validators.required])]
    	});
	}

	ngOnDestroy() {
		this.myformGroup.reset();
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	savePaymentInfo() {

    	this.submitAttempt = true;
    	if(this.myformGroup.valid) {
    		this.paymentInfo.bankname = this.myformGroup.value.bankname;
    		this.paymentInfo.accounttype = this.myformGroup.value.accounttype;
    		this.paymentInfo.accountname = this.myformGroup.value.accountname;
    		this.paymentInfo.accountnumber = this.myformGroup.value.accountnumber;
    		let modifier = {'paymentInfo': this.paymentInfo}
			Meteor.users.update({_id: Meteor.userId()}, {$set: modifier});
			this.presentToast("Cuenta guardada correctamente.");
			this.edit = false;
			this.dismiss();
	    	return true;
	    } else {
	    	this.presentToast("Debes rellenar todos los campos requeridos (*)");
	    }
	    return false;

    }

    presentToast(message: string) {
		let toast = this.toastCtrl.create({
		  message: message,
		  position: 'top',
		  duration: 3000
		});
		toast.present();
	}

}
