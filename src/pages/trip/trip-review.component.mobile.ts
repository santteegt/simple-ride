import { Component, OnInit, OnDestroy } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor/meteor';
// import { _ } from 'underscore';
// import { InjectUser } from "angular2-meteor-accounts-ui";
declare var Meteor;
declare var _;
import { NavController, NavParams, ViewController, AlertController, LoadingController, ModalController, ToastController } from 'ionic-angular';

import { Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";

import { TripUtils } from '../../classes/trip-utils.class';
import { UserProfileMobileComponent } from '../user/user-profile.component.mobile';

import { User, Trip, Reservation, Notification } from '../../shared/models';
import { Reservations, Notifications } from '../../shared/collections';
import { Keyboard } from '@ionic-native/keyboard';


interface Person {
	isDriver: boolean;
	user: User;
}

interface Review {
	score: number;
	comments: string;
	done?: boolean;
}

@Component({
  selector: 'trip-review',
  templateUrl: 'trip-review.component.mobile.html'
})
// @InjectUser('user')
export class TripReviewMobileComponent implements OnInit, OnDestroy {

	isPushNav: boolean;

	trip: Trip;
	rsvp: Reservation;
	persons: Person[];
	reviews: Review[];

	rsvpSub: Subscription;
	rsvpList: Reservation[];
	myNotifSub: Subscription;
	myNotifList: Notification[];

	tripUtils = TripUtils;

	loader;

	loadingImgs: any;

  user: any;

	constructor(private navCtrl: NavController, navParams: NavParams,
		private viewCtrl: ViewController, private modalCtrl: ModalController,
		private alertCtrl: AlertController, private loadingCtrl: LoadingController, private keyboard: Keyboard, private toastCtrl: ToastController) {

		this.trip = navParams.get("trip");
		this.rsvp = navParams.get("rsvp");
		this.persons = navParams.get("persons");
		this.isPushNav = navParams.get("isPushNav");
		this.reviews = [];
		this.loadingImgs = {};

		this.keyboard.disableScroll(false);
	}

	ngOnInit() {

    MeteorObservable.autorun().subscribe(() => {
      this.user = Meteor.user();
    });

		if(this.persons.length > 0) {

			if(this.rsvpSub) {
				this.rsvpSub.unsubscribe();
			}

			this.rsvpSub = MeteorObservable.subscribe('reservations', {}, false).subscribe(() => {

				this.rsvpList = Reservations.find({
					trip_id: this.trip._id,
					cancellation_date: undefined,
					driver_rating: undefined
				}).fetch();
			});

			this.myNotifSub = MeteorObservable.subscribe('notifications', Meteor.userId()).subscribe(() => {

				this.myNotifList = Notifications.find({
					'redirect_component': 'TripReviewMobileComponent',
					'trip_id': this.trip._id,
					'sent_date': {$lt: new Date()}
				}).fetch();
				console.log(this.myNotifList);
			});

		}

	}

	ngOnDestroy() {
		if(this.persons.length > 0) {
			this.rsvpSub.unsubscribe();
		}
		this.keyboard.disableScroll(true);

	}

	updateReviewScore(position: number, score: number) {
		if(this.reviews[position]) {
			this.reviews[position]['score'] = score;
		} else {
			this.reviews[position] = {'score': score, 'comments': undefined};
		}
		if(score < 5){
			this.presentToast('Por favor cuentanos que no te gusto del viaje!');
		}
	}

	updateReviewComment(position: number, textArea: any) {
		if(this.reviews[position]) {
			this.reviews[position]['comments'] = textArea.target.value;
		} else {
			this.reviews[position] = {'score': undefined, 'comments': textArea.target.value};
		}

	}

	existsScore(position: number, score: number): boolean {
		return this.reviews[position] != undefined && this.reviews[position].score != undefined && this.reviews[position].score >= score;
	}

	areReviewsComplete(): boolean {
		if(this.reviews && this.reviews.length > 0) {
			const totalReviews = this.persons.length;
			let isComplete = true;
			for(let i=0; i<totalReviews; i++) {
				if(!this.reviews[i].score || !this.reviews[i].comments || !this.reviews[i].done) {
					isComplete = false;
					break;
				}
			}
			return isComplete;
		} else {
			return false;
		}
	}

	isReviewComplete(position: number): boolean {
		return ( this.reviews[position] && this.reviews[position]['score']
				&& (this.reviews[position]['score'] == 5
				|| (this.reviews[position]['score'] < 5 && this.reviews[position]['comments'])) ) ? true:false;

	}

	saveReview(position: number, user: User, isDriver: boolean) {
		if(isDriver) {
			Reservations.update({'_id': this.rsvp._id},
				{$set: {
					'user_rating': this.reviews[position].score,
					'user_rating_comments': this.reviews[position].comments
				}}
			);
			let me = this;
			_.each(this.myNotifList, function(notif: Notification){
				if(notif.user_id == me.rsvp.user_id){
					Notifications.update({ '_id': notif._id }, {$set: { 'archived': true, 'read': true }});
				}
			});
			this.viewCtrl.dismiss();
		} else {
			let rsvp = _.find(this.rsvpList, function(rsvp: Reservation) {
				return rsvp.user_id == user._id;
			});
			Reservations.update({'_id': rsvp._id},
				{$set: {
					'driver_rating': this.reviews[position].score,
					'driver_rating_comments': this.reviews[position].comments
				}}
			);
			_.each(this.myNotifList, function(notif: Notification){
				if(notif.user_id == rsvp.driver_id){
					Notifications.update({ '_id': notif._id }, {$set: { 'archived': true, 'read': true }});
				}
			});
		}
		this.reviews[position].done = true;
		if(this.areReviewsComplete()) {
			let alert = this.alertCtrl.create({
			title: 'Califica tu Viaje',
			subTitle: 'Muchas gracias por calificar tu viaje!',
			buttons: [
			{
				text: 'OK',
				handler: () => {
					this.viewCtrl.dismiss();
				}
			  }]
			});
			alert.present();
		}

	}

	openUserProfile(user: User, isDriver: boolean) {
		let modal = this.modalCtrl.create(UserProfileMobileComponent, {user_id: user._id, userData: user, isDriver: isDriver});
		modal.present();

	}

	loadedImg(id: string) {
		this.loadingImgs[id] = true;
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	presentToast(message: string) {
		let toast = this.toastCtrl.create({
		  message: message,
		  position: 'top',
		  duration: 5000
		});
		toast.present();
	}

}
