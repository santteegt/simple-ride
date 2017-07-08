import { Component } from '@angular/core';

import { App, Platform, NavParams, ViewController } from 'ionic-angular';

// TODO:
// declare var cordova;

@Component({
  templateUrl: 'about.component.mobile.html'
})
export class AboutMobileComponent {

	versionCode: any;
	versionNumber: any;

	constructor(private platform: Platform, private params: NavParams, private viewCtrl: ViewController,
		private app: App) {

    // TODO:
		// cordova.getAppVersion.getVersionCode().then((versionCode) => {
		// 	this.versionCode = versionCode;
		// });
		// cordova.getAppVersion.getVersionNumber().then((versionNumber) => {
		// 	this.versionNumber = versionNumber;
		// });

	}

	ngAfterViewInit() {
		this.app._setDisableScroll(true);
	}

	dismiss() {
		this.app._setDisableScroll(false);
		this.viewCtrl.dismiss();
	}
}
