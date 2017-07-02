import { Reservation } from '../../api/both/models/reservation.model';
import { UserRating } from '../../api/both/models/reservation.structure';
// TODO:
// import { _ } from 'meteor/underscore';
declare var _;

export class TripUtils {


	static secondsToHm(time: number) {
	    let d = Number(time);
	    let h = Math.floor(d / 3600);
	    let m = Math.floor(d % 3600 / 60);

	    var hDisplay = h > 0 ? h + "h:" : "";
	    var mDisplay = m > 0 ? m + "m" : "";
	    return hDisplay + mDisplay;
	}

	static distanceToKm(distance: number) {
		return Math.floor(distance / 1000);
	}

	static getPrice(price, distance: number) {
		return parseFloat(price.toString()).toFixed(2);
	}

	static getDriverAge(bday: any) {
		let birthday = typeof(bday) == "string" ? new Date(bday): bday;

		let birthMonth = birthday.getMonth();
		let birthDay = birthday.getDate();
		let birthYear = birthday.getFullYear();

		let todayDate = new Date();
	  	let todayYear = todayDate.getFullYear();
	  	let todayMonth = todayDate.getMonth();
	  	let todayDay = todayDate.getDate();
	  	let age = todayYear - birthYear; 

		if (todayMonth < birthMonth - 1) {
			age--;
		}

		if (birthMonth - 1 == todayMonth && todayDay < birthDay) {
			age--;
		}
		return age;

	}

	static calculateUsersRating(usersRSVPs: Reservation[], isDriver: boolean) {
		let userRating: UserRating[] = [];
		const groupByKey = isDriver ? 'driver_id':'user_id';
		const scoreField = isDriver ? 'user_rating':'driver_rating';
		let rsvpListByDriver = _.groupBy(usersRSVPs, function(rsvp: Reservation) {
			return rsvp[groupByKey];
		});

		let driverList = _.keys(rsvpListByDriver);

		_.each(driverList, function(user_id: string) {
			let sumRatings = _.reduce(rsvpListByDriver[user_id], function(memory: number, rsvp: Reservation) {
				return memory + rsvp[scoreField];
			}, 0);
			console.log(user_id + " " + sumRatings);
			let totalRatings = rsvpListByDriver[user_id].length;
			userRating.push({user_id: user_id, score: sumRatings / totalRatings});

		});
		return userRating;

	}

}