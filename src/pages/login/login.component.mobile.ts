import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { App, Platform, NavController, MenuController, AlertController, NavParams,
	ModalController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { NativeStorage } from '@ionic-native/native-storage';
import { MeteorObservable } from "meteor-rxjs";
// TODO:
// import { Meteor } from 'meteor-client';
declare var Meteor;

import { DashboardMobileComponent } from '../dashboard/dashboard.component.mobile';
import { IntroSlidesMobileComponent } from '../intro/intro-slides.component.mobile';
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

	skipEnabled: Boolean;

	constructor(private app: App, private navCtrl: NavController, private loginManager: FacebookLoginManager,
		private ngZone: NgZone, private platform: Platform, private menuCtrl: MenuController,
		private alertCtrl: AlertController, private push: Push, private navParams: NavParams,
		private modalCtrl: ModalController, private nativeStorage: NativeStorage) {

  	}

  	ngOnInit() {
		this.menuCtrl.enable(false);
		if(this.platform.is('cordova')) {

			this.nativeStorage.getItem('user_data')
			.then(
			data => this.skipEnabled = !data || !data.loggedIn,
			error => {
				if(error.code != 2) {
			    	console.error('An error occured while trying to use native storage ', error);
			  	}
			  	this.skipEnabled = true; //item not found
			});
		} else { //just for development purposes
			this.skipEnabled = true;
		}
	}

	ionViewDidEnter() {

		if(this.platform.is('cordova')) {

			this.nativeStorage.getItem('user_data')
			.then(
			data => {
				const _loggedIn = data && data.loggedIn;
				if(!_loggedIn) {
					this.modalCtrl.create(IntroSlidesMobileComponent).present();
				}
			},
			error => {
				if(error.code != 2) {
			    	console.error('An error occured while trying to use native storage ', error);
			  	} else {
			  		this.modalCtrl.create(IntroSlidesMobileComponent).present();
			  	}
			});
		} else { // just for development purposes
			this.modalCtrl.create(IntroSlidesMobileComponent).present();
		}

	}

	ngOnDestroy() {

	}

	exploreApp() {
		this.app.getRootNav().setRoot(DashboardMobileComponent, {});
	}

  	login() {
  		this.loginManager.login().then(msg => { //redirection is handled automatically by the AppMobileComponent
			const options: any = {
			// const options: PushOptions = {
	          android: {
	            senderID: "93847795927",
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
			let device_type = this.platform.is('ios') ? 'ios':(this.platform.is('android') ? 'android':'other');
	        MeteorObservable.call('updateUserDevice', Meteor.userId(), device_type).subscribe((rs) => {});
  		})
  		.catch((error) => {
  			console.log(error);
  			alert(error);
  		});
  	}

}
