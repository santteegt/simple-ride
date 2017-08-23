import { Component } from '@angular/core';

import { App, Platform, NavParams, ViewController } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@Component({
  templateUrl: 'about.component.mobile.html'
})
export class AboutMobileComponent {

	versionCode: any;
	versionNumber: any;

	constructor(private platform: Platform, private params: NavParams, private viewCtrl: ViewController,
		private app: App, private appVersion: AppVersion, private iab: InAppBrowser) {

		if(platform.is('cordova')) {

			this.appVersion.getVersionCode().then((versionCode) => {
				this.versionCode = versionCode;
			});
			this.appVersion.getVersionNumber().then((versionNumber) => {
				this.versionNumber = versionNumber;
			});
		}

	}

	ngAfterViewInit() {
		// this.app._setDisableScroll(true);
	}

	openURL(url: string) {

		if(this.platform.is('cordova')) {
			this.iab.create(url);
		}
	}

	dismiss() {
		this.app._setDisableScroll(false);
		this.viewCtrl.dismiss();
	}
}
