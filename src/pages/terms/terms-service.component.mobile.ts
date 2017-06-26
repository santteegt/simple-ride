import { Component } from '@angular/core';
import { Platform, NavParams, ViewController } from 'ionic-angular';


@Component({
  selector: 'terms-of-service',
  templateUrl: 'terms-service.component.mobile.html'
})
export class TermsOfServiceMobileComponent {

	constructor(public platform: Platform, public params: NavParams, public viewCtrl: ViewController) {

	}

	dismiss() {
		this.viewCtrl.dismiss();
	}
}