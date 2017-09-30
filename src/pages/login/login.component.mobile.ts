import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { Platform, NavController, MenuController, AlertController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
// TODO:
// import { Meteor } from 'meteor-client';
declare var Meteor;

import { FacebookLoginManager } from '../../classes/facebook-login.class';
import { User } from "../../shared/models";

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
		private platform: Platform, private menuCtrl: MenuController, private alertCtrl: AlertController, private push: Push) {


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
		this.menuCtrl.enable(false);
	}

	ngOnDestroy() {

	}

  	login() {
  		this.loginManager.login().then(msg => { //redirection is handled automatically by the AppMobileComponent

			const options: PushOptions = {
	          android: {
	            // senderID: "93847795927",
	            sound: true,
	            vibrate: true,
	            clearBadge: true
	          },
	          ios: {
	            alert: true,
	            badge: true,
	            sound: true,
	            clearBadge: true
	          }

	        };

	        const pushObject: PushObject = this.push.init(options);

	        pushObject.on('registration').subscribe((registration: any) => {
	        	let token = undefined;
	        	if(this.platform.is('ios')) {
	        		token = { apn: registration.registrationId };
	        	}
	        	if(this.platform.is('android')) {
	        		token = { gcm: registration.registrationId };
	        	}
	        	if(token) {
		          Meteor.call('raix:push-update', {
		            appName: "SimpleRide",
		            token: token,
		            userId: Meteor.userId()
		          });
		      	}
	        });
	        pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));

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
