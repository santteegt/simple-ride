// TODO:
// import {Meteor} from 'meteor-client';
declare var Meteor;
import {Injectable} from '@angular/core';

@Injectable()
export class FacebookLoginManager {

	constructor() {

	}

	login() {
		const p = new Promise((resolve, reject) => {
        
			(<any>Meteor).loginWithFacebook({
			  requestPermissions: ['user_friends', 'public_profile', 'email'],
			  loginStyle: 'redirect'
			}, (err) => {

			  if (err) {
			  	console.log(err);
			  	reject("Something went wrong. Try Again");
			    // handle error
			  } else {
			  	// Meteor.logoutOtherClients((error) => {
			  	// 	if(error) {
			  	// 		console.log('Something went wrong while logging out user on other devices');
			  	// 	}
			  	// });
			  	resolve("logged in successfully!"); //TODO: check if user exists
			    // successful login!
			  }
			});
		});

		return p;
	}

	logout() {

		Meteor.logout(function(err){
            if (err) {
                throw new Meteor.Error("Logout failed");
            }
        });
	}
}