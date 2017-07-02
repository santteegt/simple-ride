import { Injectable } from '@angular/core';
import { Meteor } from 'meteor-client';
import { Geolocation } from '@ionic-native/geolocation';
import { Platform } from 'ionic-angular';
// TODO: migrate funcitonality
// import { BackgroundLocation } from 'meteor/mirrorcell:background-geolocation-plus';

import { UserTripFlag, GLocation } from "../../shared/models";
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

	constructor(private platform: Platform, private geolocation: Geolocation) {

	}

	// TODO: migrate functionality
	configureBackgroundLocation(userTripFlag: UserTripFlag) {
		console.log('configuring background geolocation for ' + Meteor.userId());

    	console.log(userTripFlag);
		///Configure Plugin
		// TODO:
    // 	BackgroundLocation.configure({
		  // desiredAccuracy: 5, // Desired Accuracy of the location updates (lower = more accurate).
	   //    distanceFilter: 1, // (Meters) Distance between points aquired.
	   //    debug: false, // Show debugging info on device.
	   //    interval: 10000, // (Milliseconds) Requested Interval in between location updates.
	   //    useActivityDetection: true, // Shuts off GPS when your phone is still, increasing battery life enormously
	      
	   //    //[Android Only Below]
	   //    notificationTitle: 'BG Plugin', // Customize the title of the notification.
	   //    notificationText: 'Tracking', // Customize the text of the notification.
	   //    fastestInterval: 5000, //(Milliseconds) - Fastest interval OS will give updates.
	   //  });

	    //Register a callback for location updates.
	    //this is where location objects will be sent in the background

	    // TODO:
	  //   BackgroundLocation.registerForLocationUpdates((location: GLocation) => {
	  // //   	console.log(userTripFlag);
			// // console.log("We got a Background Update" + JSON.stringify(location));
			// UserRideMonitors.insert({
			// 	user_id: userTripFlag.user_id,
			// 	isDriver: userTripFlag.isDriver,
			// 	trip_id: userTripFlag.trip_id,
			// 	timestamp: new Date(),
			// 	error: false,
			// 	geolocation: location
			// });
	  //   }, (err) => {
			// // console.log("Error: Did not get an update", err);
			// UserRideMonitors.insert({
			// 	user_id: userTripFlag.user_id,
			// 	isDriver: userTripFlag.isDriver,
			// 	trip_id: userTripFlag.trip_id,
			// 	timestamp: new Date(),
			// 	error: true,
			// 	errorMsg: err.toString(),
			// });
	  //   });

	    //Register a callback for activity updates 
	    //If you set the option useActivityDetection to true you will recieve
	    //periodic activity updates, see below for more information
	    
	    // TODO:
	  //   BackgroundLocation.registerForActivityUpdates((activities) => {
	  //   	// console.log("ENTRA ACTIVITIES");
	  //    //  	console.log("We got an activity Update" + JSON.stringify(activities));

	  //     	const keys = _.keys(activities);
	  //     	let activity: any = {};
	  //     	_.each(keys, function(key: string) {
	  //     		activity[key.toLowerCase()] = activities[key];
	  //     	});
	  //     	UserRideMonitors.insert({
			// 	user_id: userTripFlag.user_id,
			// 	isDriver: userTripFlag.isDriver,
			// 	trip_id: userTripFlag.trip_id,
			// 	timestamp: new Date(),
			// 	error: false,
			// 	activity: activity
			// });
	  //   }, (err) => {
			// // console.log("Error:", err);
   //    		UserRideMonitors.insert({
			// 	user_id: userTripFlag.user_id,
			// 	isDriver: userTripFlag.isDriver,
			// 	trip_id: userTripFlag.trip_id,
			// 	timestamp: new Date(),
			// 	error: true,
			// 	errorMsg: err.toString(),
			// });
	  //   });
	}

	startBackgroundGeolocation() {
		console.log('starting background geolocation');
		// TODO:
		// BackgroundLocation.start();
	}

	stopBackgroundGeolocation() {
		console.log('Stopping background geolocation');
		// TODO:
		// BackgroundLocation.stop();
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
	  				reject("Error using native geolocation");
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
			            alert("This device browser does not support geolocation");
			            console.log(error);
			            me.currentPosition = {
			            	lat: -2.9004014,
			            	lng: -79.00145669999999
			            }
			            resolve(me.currentPosition);
			        });

	  			} else {
	  				alert("Geolocation not supported on this device");
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
}