import { Component } from '@angular/core';

import { App, Platform, NavParams, ViewController } from 'ionic-angular';

declare var cordova;

@Component({
  templateUrl: 'offline-page.component.mobile.html'
})
export class OfflinePageMobileComponent {

	versionCode: any;
	versionNumber: any;

	legend: string

	constructor(private platform: Platform, private params: NavParams, private viewCtrl: ViewController,
		private app: App) {

		this.legend = 'Conectando con el servidor...';

		this.app._setDisableScroll(true);


	}

}
