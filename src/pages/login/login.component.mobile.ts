import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { Platform, NavController, MenuController, AlertController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { FacebookLoginManager } from '../../classes/facebook-login.class';
import { User } from "../../../api/both/models/user.model";

import { HomePage } from '../home/home';

declare var cordova;

@Component({
  selector: 'login',
  templateUrl: 'login.component.mobile.html',
  providers: [ FacebookLoginManager ]
})

export class LoginMobileComponent implements OnInit, OnDestroy {
	usersSub: Subscription;
	user: User;

	constructor(private navCtrl: NavController, private loginManager: FacebookLoginManager, private ngZone: NgZone, 
		private platform: Platform, private menuCtrl: MenuController, private alertCtrl: AlertController) {


		this.platform.resume.subscribe((e: any) => {
			if(this.platform.is('cordova')) {
				this.validateGeolocation();
			}
		});

		this.platform.ready().then(() => {
			if(this.platform.is('cordova')) {
				this.validateGeolocation();
			}
		});
  	}

  	ngOnInit() {
		// this.usersSub = MeteorObservable.subscribe("userData").subscribe();
		this.menuCtrl.enable(false);

		// MeteorObservable.autorun().subscribe(() => {
		// 	if(Meteor.user()) {
		// 		this.navCtrl.push(HomePage, {});
		// 	} else {
		// 		console.log('User not found');
		// 	}
		// });
	}

	ngOnDestroy() {
		// this.usersSub.unsubscribe();

	}

  	login() {
  		this.loginManager.login().then(msg => { //redirection is handled automatically by the AppMobileComponent
  			alert(msg);
			if(Meteor.user()["personData"] && Meteor.user()["personData"].status == "new") {
				// this.navCtrl.push(UserRegistrationMobileComponent, {
	   //  	});
			} else {
				// this.navCtrl.push(DashboardMobileComponent, {
	   //  	});
			}

  		})
  		.catch((error) => {
  			console.log(error);
  			alert(error);
  		});
  	}

	validateGeolocation(){

		let isLocationEnabled = this.platform.is('ios') ? 
			cordova.plugins.diagnostic.isLocationEnabled:cordova.plugins.diagnostic.isGpsLocationEnabled;

		isLocationEnabled((enabled) => {
			if(!enabled) {
				let alert = this.alertCtrl.create({
				'title': 'Geolocalización desactivada',
				'subTitle': 'Por favor activa la geolocolazación para continuar',
				buttons: [
					{
					text: 'OK',
					handler: () => {
						let switchToSettings = this.platform.is('ios') ? 
						cordova.plugins.diagnostic.switchToSettings:cordova.plugins.diagnostic.switchToLocationSettings;
						switchToSettings();
					}
					}]
				});
				alert.present();
			}
		},
		(error) => {
		console.log(error);
		});
	}
}
