import { Component, OnInit, OnDestroy } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor/meteor';
// import { _ } from 'underscore';
declare var Meteor;
declare var _;
import { NavController, NavParams, ViewController, ModalController, LoadingController } from 'ionic-angular';

import { Observable, Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";

import { UserRating } from '../../shared/models/reservation.structure';
import { User, CarRecord, UserRecord, Reservation, CONVERSATIONSTYLES } from '../../shared/models';
import { Users, CarRecords, UserRecords, Reservations } from '../../shared/collections';

import { TripUtils } from '../../classes/trip-utils.class';

@Component({
  selector: 'user-profile',
  templateUrl: 'user-profile.component.mobile.html',
})
export class UserProfileMobileComponent implements OnInit, OnDestroy {

	card: string;
	tabs: string;

	myCarSub: Subscription;
	myCarOb: Observable<CarRecord[]>;

	myUserRecordSub: Subscription;
	myUserRecordOb: Observable<UserRecord[]>;

	rsvpSub: Subscription;
	reviewsOb: Observable<Reservation[]>;
	userRating: UserRating[];

	reviewersSub: Subscription;
	reviewers: User[];

	loader;

	user_id: string;
	userData;
	isDriver: boolean;
	isPushNav: boolean;

	tripUtils = TripUtils;

	loadingImgs: any;

  conversationStyle: any;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private modalCtrl: ModalController, private loadingCtrl: LoadingController) {

		this.card = "Matricula";
		this.tabs = "profile";
		this.user_id = navParams.get("user_id");
		this.isDriver = navParams.get("isDriver");
		this.userData = navParams.get("userData");
		this.isPushNav = navParams.get("isPushNav");

	    this.conversationStyle = CONVERSATIONSTYLES.styles.filter((style) => {
	      return style.name == this.userData.personData.conversation;
	    });
		this.reviewers = [];
		this.loadingImgs = {};
	}

	ngOnInit() {

		this.loader = this.loadingCtrl.create({
	      content: "Cargando...",
	      spinner: "crescent"
	    });
	    this.loader.present();


		if (this.myCarSub) {
        	this.myCarSub.unsubscribe();
      	}

      	if (this.myUserRecordSub) {
        	this.myUserRecordSub.unsubscribe();
      	}

      	if (this.rsvpSub) {
        	this.rsvpSub.unsubscribe();
      	}

      	if (this.reviewersSub) {
        	this.reviewersSub.unsubscribe();
      	}

    	this.myCarSub = MeteorObservable.subscribe('car-record', this.user_id).subscribe(() => {
        	this.myCarOb = CarRecords.find({}).zone();
        	this.loader.dismiss();
      	});

      	this.myUserRecordSub = MeteorObservable.subscribe('user-record', this.user_id).subscribe(() => {
        	this.myUserRecordOb = UserRecords.find({}).zone();
      	});

      	this.rsvpSub = MeteorObservable.subscribe('reservations', {sort: {'reservation_date': -1}}, false).subscribe(() => {

      		let selector = {};
      		selector[this.isDriver ? 'user_rating':'driver_rating'] = { $ne: undefined };
      		selector[this.isDriver ? 'driver_id':'user_id'] = this.user_id;

      		let driverRSVP = Reservations.find(selector);
      		let driverRSVPList = driverRSVP.fetch();

			this.userRating = this.tripUtils.calculateUsersRating(driverRSVPList, this.isDriver);

			console.log(this.userRating);

			let reviewers_ids = _.map(driverRSVPList, (reservation: Reservation) => {
				return reservation[this.isDriver ? 'user_id':'driver_id'];
			});

			this.reviewersSub = MeteorObservable.subscribe('user-public-data', reviewers_ids).subscribe(() => {
				this.reviewers = Users.find({_id: {
					$in: reviewers_ids
				}}).fetch();
				// this.loader.dismiss();
			});

			this.reviewsOb = driverRSVP.zone();

      	});


	}

	getUserRating(user_id: string) {
		if(this.userRating && this.userRating.length > 0) {
			let userRating = _.find(this.userRating, function(userRating: UserRating) {
				return userRating.user_id == user_id;
			});
			return userRating.score;
		} else {
			return 0;
		}

	}

	getUserInfo(review: Reservation) {
		let user_id = this.isDriver ? review.user_id:review.driver_id;
		return _.find(this.reviewers, function(user: User) {
			return user._id == user_id;
		});

	}

	getReviewerRating(review: Reservation) {
		let key = this.isDriver ? 'user_rating':'driver_rating';
		return review[key];
	}

	loadedImg(id: string) {
		this.loadingImgs[id] = true;
	}

	ngOnDestroy() {
		this.myCarSub.unsubscribe();
		this.myUserRecordSub.unsubscribe();
		this.reviewersSub.unsubscribe();
		this.rsvpSub.unsubscribe();

	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	showInfo() {
		console.log('entra');
	}

}
