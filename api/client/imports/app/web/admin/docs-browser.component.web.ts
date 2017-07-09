import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, Subject } from "rxjs";
import { FormsModule }   from '@angular/forms';
import { MeteorObservable } from "meteor-rxjs"
import { InjectUser } from "angular2-meteor-accounts-ui";
import { _ } from 'underscore';

import { FacebookLoginManager } from '../../shared-components/login/facebook-login.class';

import { Images } from '../../../../../both/collections/images.collection';
import { Image, DOCTYPES } from '../../../../../both/models/image.model';
import { Reservations } from '../../../../../both/collections/reservations.collection';
import { Reservation, RESERVATIONSTATUS } from '../../../../../both/models/reservation.model';
import { User } from '../../../../../both/models/user.model';

import template from './docs-browser.component.web.html';
import style from './docs-browser.component.web.scss';

interface ServerResponse {
	status: number;
	message: string;
}

interface UsersServerResponse {
	status: number;
	message: string;
	users: any;
}

@Component({
  selector: 'docs-browser',
  template,
  styles: [ style ],
  providers: [ FacebookLoginManager ]
})
@InjectUser('user')
export class DocumentBrowserComponent implements OnInit, OnDestroy {

	rsvpSub: Subscription;
	rsvpList: Reservation[];
	rsvpObs: Observable<Reservation[]>;

	userList: User[];
	userObs: Observable<User[]>;

	voucherSub: Subscription;
	voucherObs: Observable<Image[]>;

	dniSub: Subscription;
	dniObs: Observable<Image[]>;

	licenseSub: Subscription;
	licenseObs: Observable<Image[]>;

	registerSub: Subscription;
	registerObs: Observable<Image[]>;

	comments;

	constructor(private loginManager: FacebookLoginManager) {
		
	}

	ngOnInit() {

		if(this.voucherSub) {
    		this.voucherSub.unsubscribe();
    	}

		if(this.rsvpSub) {
    		this.rsvpSub.unsubscribe();
    	}

		this.rsvpSub = MeteorObservable.subscribe('reservations', {sort: {'reservation_date': -1}}).subscribe(() => {

			let reservations = Reservations.find({
				'cancellation_date': undefined,
				'departure_date': {$gte: new Date()},
				'payment_status': RESERVATIONSTATUS.PROCESSING_PAYMENT
			});
			this.rsvpList = reservations.fetch();

			let rsvpArray = _.map(this.rsvpList, function(rsvp: Reservation) {
				return rsvp._id;
			});

			this.voucherSub = MeteorObservable.subscribe("images").subscribe(() => {
	          this.voucherObs = Images.find({'rsvp_id': {$in: rsvpArray}, 'processed': undefined}).zone();
			});
		});

		MeteorObservable.call('getVerifingUsers').subscribe((response: UsersServerResponse) => {
  			if(response.status == 200){
  				console.log(response);
	  			this.userList = response.users;

	  			let userArray = _.map(this.userList, function(user: User) {
					return user._id;
				});

	  			this.dniSub = MeteorObservable.subscribe("images").subscribe(() => {
		          this.dniObs = Images.find({'user_id': {$in: userArray}, 'doc_type': DOCTYPES.DNI, 'processed': undefined}).zone();
				});

				this.licenseSub = MeteorObservable.subscribe("images").subscribe(() => {
		          this.licenseObs = Images.find({'user_id': {$in: userArray}, 'doc_type': DOCTYPES.LICENSE, 'processed': undefined}).zone();
				});

				this.registerSub = MeteorObservable.subscribe("images").subscribe(() => {
		          this.registerObs = Images.find({'user_id': {$in: userArray}, 'doc_type': DOCTYPES.CAR_REGISTER, 'processed': undefined}).zone();
				});
			}
  		});
	}

	getRSVP(rsvp_id: string) {
		return _.find(this.rsvpList, function(rsvp: Reservation) {
			return rsvp._id == rsvp_id;
		});
	}

	getUser(user_id: string) {
		return _.find(this.userList, function(user: User) {
			return user._id == user_id;
		});
	}

	approveVoucher(voucher: Image) {
		Images.update({'_id': voucher._id}, {$set: {processed: true}});
		Reservations.update({'_id': voucher.rsvp_id}, {$set: {
			payment_status: RESERVATIONSTATUS.PROCESSED,
			payment_reference_id: voucher._id,
			payment_comments: undefined
		}});

		MeteorObservable.call('notifyPayment', voucher.rsvp_id, true).subscribe((response: ServerResponse) => {
  			// nothing to do
  		});

	}

	denyVoucher(voucher: Image) {
		console.log(voucher);
		let rs = Images.update({'_id': voucher._id}, {$set: {processed: true}});
		// rs.subscribe((result) => {
		// 	console.log('result for images');
		// 	console.log(result);
		// });
		let rs2 = Reservations.update({'_id': voucher.rsvp_id}, {$set: { 
				payment_status: RESERVATIONSTATUS.WAITING_USER_ACTION, 
				payment_comments: this.comments
		}});
		// rs2.subscribe((result) => {
		// 	console.log('result for reservations');
		// 	console.log(result);
		// });

		MeteorObservable.call('notifyPayment', voucher.rsvp_id, false).subscribe((response: ServerResponse) => {
  			// nothing to do
  		});
	}

	approveDocument(document: Image) {
		Images.update({'_id': document._id}, {$set: {processed: true}});
		MeteorObservable.call('updateUserStatus', document.user_id, document.doc_type, true).subscribe((response: ServerResponse) => {
  			// nothing to do
  		});
	}

	denyDocument(document: Image) {
		console.log(document);
		Images.update({'_id': document._id}, {$set: {processed: true}});
		MeteorObservable.call('updateUserStatus', document.user_id, document.doc_type, false).subscribe((response: ServerResponse) => {
  			// nothing to do
  		});
	}

	ngOnDestroy() {
		this.voucherSub.unsubscribe();
		this.rsvpSub.unsubscribe();

	}

  	login() {
  		this.loginManager.login().then(msg => {
  			
			// if(Meteor.user()["personData"] && Meteor.user()["personData"].status == "new") {
			// 	this.navCtrl.push(UserRegistrationMobileComponent, {
	  //   	});
			// } else {
			// 	this.navCtrl.push(DashboardMobileComponent, {
	  //   	});
			// }

  		})
  		.catch((error) => {
  			console.log(error);
  			alert(error);
  		});
  	}
 
}