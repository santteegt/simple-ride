import { Injectable } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor-client';
declare var Meteor;
import { Geolocation } from '@ionic-native/geolocation';
import { Platform, AlertController } from 'ionic-angular';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';

import { UserTripFlag } from "../../shared/models";
import { UserRideMonitors } from "../../shared/collections";

// TODO:
// import { _ } from 'meteor/underscore';
declare var _;

interface GeoPosition {
	lat: number,
	lng: number
}

interface Location {
	country: string,
	state: string,
	city: string
}

declare var google;

@Injectable()
export class GeolocationService {

	public currentPosition: GeoPosition;

	_currentPositionPromise: Promise<GeoPosition>;
	_currentLocationPromise: Promise<any>;

	_tripFlagSub: Subscription;

	constructor(private platform: Platform, private backgroundGeolocation: BackgroundGeolocation, private geolocation: Geolocation, private alertCtrl: AlertController) {

	}

	configureBackgroundLocation(userTripFlag: UserTripFlag) {

	   const config: BackgroundGeolocationConfig = {
            desiredAccuracy: 10,
            stationaryRadius: 20,
            distanceFilter: 1,
            debug: false, //  enable this hear sounds for background-geolocation life-cycle.
            stopOnTerminate: false, // enable this to clear background location settings when the app terminates
            pauseLocationUpdates: false // iOS only
    	};

	  	this.backgroundGeolocation.configure(config).subscribe((location: BackgroundGeolocationResponse) => {

		    //   	console.log(userTripFlag);
			console.log("We got a Background Update" + JSON.stringify(location));
			UserRideMonitors.insert({
				user_id: userTripFlag.user_id,
				isDriver: userTripFlag.isDriver,
				trip_id: userTripFlag.trip_id,
				timestamp: new Date(),
				error: false,
				geolocation: location
			});

		    // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
		    // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
		    // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
		    this.backgroundGeolocation.finish(); // FOR IOS ONLY

		  });
	}

	startBackgroundGeolocation() {
		console.log('starting background geolocation');
		this.backgroundGeolocation.start();
	}

	stopBackgroundGeolocation() {
		console.log('Stopping background geolocation');
		this.backgroundGeolocation.stop();
	}

	getCurrentGeolocation(): Promise<GeoPosition> {
		const me = this;
		this.currentPosition = undefined;


		this._currentPositionPromise = new Promise<GeoPosition>((resolve: Function, reject: Function) => {

			if(this.platform.is('cordova')) {
	  			this.geolocation.getCurrentPosition().then((position) => {
	  				me.currentPosition = {
	  					lat: position.coords.latitude,
	  					lng: position.coords.longitude
	  				}
	  				console.log(me.currentPosition);
	  				resolve(me.currentPosition);
	  			}).catch((error) => {
						me.presentAlert('Error', 'Error using native geolocation');
						me.currentPosition = {
							lat: -2.9004014,
							lng: -79.00145669999999
						}
						resolve(me.currentPosition);
	  			});

	  		} else {
	  			if(navigator.geolocation) {

	  				navigator.geolocation.getCurrentPosition(function(position) {
			            me.currentPosition = {
			              lat: position.coords.latitude,
			              lng: position.coords.longitude
			            };
			            resolve(me.currentPosition);

			        }, function(error) {
			            me.presentAlert('Error', 'Este navegador no soporta geolocalización');
			            console.log(error);
									me.currentPosition = {
										lat: -2.9004014,
			            	lng: -79.00145669999999
									}
			            resolve(me.currentPosition);
			        });

	  			} else {
            me.presentAlert('Error', 'Este dispositivo no soporta geolocalización');
						this.currentPosition = {
							lat: -2.9004014,
							lng: -79.00145669999999
						}
            resolve(me.currentPosition);
	  			}
	  		}
  		});

		return this._currentPositionPromise;

	}

	getCurrentLocation(position?: GeoPosition): Promise<Location> {
		var geocoder = new google.maps.Geocoder;

		this._currentLocationPromise = new Promise<Location>((resolve: Function, reject: Function) => {

			geocoder.geocode({'location': position}, function(results, status) {
				if (status === 'OK') {
					let rs = results[0];
					let country = _.find(rs.address_components, function(comp){ return comp.types.indexOf('country') > -1 });
					let state = _.find(rs.address_components, function(comp){
						return comp.types.indexOf('administrative_area_level_1') > -1 });
					let city = _.find(rs.address_components, function(comp){ return comp.types.indexOf('locality') > -1 });
					resolve({country: country.long_name, state: state.long_name, city: city.long_name});

				} else {
					reject('Geocoder failed due to: ' + status);
	          }
        	});
		});

		return this._currentLocationPromise;

	}

  presentAlert(title: string, message: string) {
		let alert = this.alertCtrl.create({
	      'title': title,
	      'subTitle': message,
	      buttons: [
        {
          text: 'OK'
        }]
	    });
	    alert.present();
	}
}
