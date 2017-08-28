import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription, Subject } from "rxjs";
import { FormsModule }   from '@angular/forms';
import { MeteorObservable } from "meteor-rxjs";
import { Router, ActivatedRoute } from '@angular/router';
// TODO:
// import { InjectUser } from "angular2-meteor-accounts-ui";
import { _ } from 'underscore';

import { TabsetComponent, BsDropdownModule } from 'ngx-bootstrap';

import { FacebookLoginManager } from '../../shared-components/login/facebook-login.class';

import { Users, Trips, Reservations } from '../../../../../both/collections';
import { RESERVATIONSTATUS } from '../../../../../both/models';

import template from './trip.component.web.html';
import style from './trip.component.web.scss';

interface ServerResponse {
	status: number;
	message: string;
}

@Component({
  selector: 'trip',
  template,
  styles: [ style ],
  providers: [ FacebookLoginManager ]
})
// @InjectUser('user')
export class TripComponent implements OnInit, OnDestroy {

	autoSub: Subscription;
	isAdmin: boolean;
	user: any;
	users: User[];

	usersSub: Subscription;

	tripSub: Subscription;
	trip: any;

	reservationsSub: Subscription;
	reservationsObs: any;

	driver_id: string;

	trip_id: string;

	total: number;
	expenses: number;
	iva: number;
	insurance: number;
	paymentInfo: any;

	constructor(private loginManager: FacebookLoginManager, private router: Router, private route: ActivatedRoute) {
		this.total = this.expenses = this.iva = this.insurance = 0;
	}

	ngOnInit() {

		this.autoSub = MeteorObservable.autorun().subscribe(() => {
			this.user = Meteor.user();
			if(this.user && !Meteor.loggingIn()){

				MeteorObservable.call('isAdmin', this.user._id).subscribe((response: ServerResponse) => {
		      if(this.isAdmin = response.status == 200){

						this.autoSub = this.route.params.subscribe(params => {
							this.trip_id = params['id'];
							this.tripSub = MeteorObservable.subscribe('trips', {}).subscribe(() => {
								this.trip = Trips.findOne({
									'_id': this.trip_id
								});
							});

							this.reservationsSub = MeteorObservable.subscribe('reservations', {}, false).subscribe(() => {
								let reservations = Reservations.find({
									'trip_id': this.trip_id,
									'payment_status': RESERVATIONSTATUS.PROCESSED
								});
								let rsvpArray = reservations.fetch();
								this.driver_id = rsvpArray[0].driver_id;
								this.reservationsObs = reservations.zone();
								let users = _.unique(_.map(rsvpArray, function(rsvp: Reservation) {
									return rsvp.user_id;
								}));
								users.push(this.driver_id);
								rsvpArray.forEach(rsvp => this.total += rsvp.total );
								let utility = this.total * .15;
								this.expenses = (utility / 1.12).toFixed(2);
								this.iva = (this.expenses * .12).toFixed(2);
								this.insurance = (this.total * .1).toFixed(2);
								this.usersSub = MeteorObservable.subscribe('user-public-data', users).subscribe(() => {
									this.users = Users.find({_id: {
										$in: users
									}}).fetch();
									this.getPaymentInfo();
								});
							});
						});
					}else{
						this.loginManager.logout();
						this.router.navigate(['/admin']);
					}
		    });
			}else if(Meteor.loggingIn()){
				this.isAdmin = false;
			}else{
				this.loginManager.logout();
				this.router.navigate(['/admin']);
			}
		});
	}

	getUserInfo(user_id: string) {
		return _.find(this.users, function(user: User) {
			return user._id == user_id;
		});
	}

	getPaymentInfo(){
		me = this;
		let driver = _.find(this.users, function(user: User) {
			return user._id == me.driver_id;
		});
		this.paymentInfo = driver.paymentInfo;
	}

	ngOnDestroy() {
		if(this.tripSub){
			this.tripSub.unsubscribe();
		}
		if(this.reservationsSub){
			this.reservationsSub.unsubscribe();
		}
		if(this.driverSub){
			this.driverSub.unsubscribe();
		}
	}

	logout() {
		this.loginManager.logout();
	}

}
