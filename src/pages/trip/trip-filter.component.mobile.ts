import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

import { Utils } from '../../classes/shared/utils';

@Component({
  templateUrl: 'trip-filter.component.mobile.html',
  providers: [ Utils ]
})
export class TripFilterMobileComponent {


	dateFrom;
	dateTo;
	currentDate: string;
	maxDate: string;
	tripOptions;
	callbackFrom;
	callbackTo;
	callbackOptions;


	constructor(private navParams: NavParams, private viewCtrl: ViewController, private utils: Utils) {
		this.dateFrom = new Date().toISOString();
		let today = new Date();
		this.currentDate = this.utils.dateToString(today);
		today.setFullYear(today.getFullYear() + 3);
		this.maxDate = this.utils.dateToString(today);
		this.tripOptions = {};
	}

	sendFromSignal() {
		this.callbackFrom(this.dateFrom);
	}

	sendToSignal() {
		this.callbackTo(this.dateTo);
	}

	sendOptionsSignal() {
		this.callbackOptions(this.tripOptions);
	}

	ngOnInit() {
		if (this.navParams.data) {
			this.callbackFrom = this.navParams.data.callbackFrom;
	    	this.callbackTo = this.navParams.data.callbackTo;
		    this.callbackOptions = this.navParams.data.callbackOptions;
		}
	}
}
