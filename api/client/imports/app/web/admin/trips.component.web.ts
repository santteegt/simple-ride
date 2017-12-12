import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription, Subject } from "rxjs";
import { FormsModule }   from '@angular/forms';
import { MeteorObservable } from "meteor-rxjs";
import { Router } from '@angular/router';
// TODO:
// import { InjectUser } from "angular2-meteor-accounts-ui";
import { _ } from 'underscore';

import { TabsetComponent, BsDropdownModule } from 'ngx-bootstrap';

import { FacebookLoginManager } from '../../shared-components/login/facebook-login.class';

import { Trips } from '../../../../../both/collections/trips.collection';

import template from './trips.component.web.html';
import style from './trips.component.web.scss';

interface ServerResponse {
	status: number;
	message: string;
}

@Component({
  selector: 'trips',
  template,
  styles: [ style ],
  providers: [ FacebookLoginManager ]
})
// @InjectUser('user')
export class TripsComponent implements OnInit, OnDestroy {

	@ViewChild('documents') staticTabs: TabsetComponent;

	autoSub: Subscription;
	isAdmin: boolean;
	user: any;

	tripsSub: Subscription;
	tripsObs: any;

	cancelledTripsSub: Subscription;
	cancelledTripsObs: any;

	constructor(private loginManager: FacebookLoginManager, private router: Router) {

	}

	ngOnInit() {
		this.autoSub = MeteorObservable.autorun().subscribe(() => {
			this.user = Meteor.user();
			if(this.user && !Meteor.loggingIn()){
				MeteorObservable.call('isAdmin').subscribe((response: ServerResponse) => {
					if(this.isAdmin = response.status == 200){
						this.tripsSub = MeteorObservable.subscribe('trips', {sort: {'cancellation_date': 1}}).subscribe(() => {

							this.tripsObs = Trips.find({
								'cancellation_date': undefined,
								'confirmed_places': {$gt: 0}
							}).zone();

						});

						this.cancelledTripsSub = MeteorObservable.subscribe('trips', {sort: {'cancellation_date': 1}}).subscribe(() => {

							this.cancelledTripsObs = Trips.find({
								'cancellation_date': {$lte: new Date()},
								'confirmed_places': {$gt: 0}
							}).zone();

						});

					}else{
						this.loginManager.logout();
						this.router.navigate(['/admin']);
					}
				});
			}else if(Meteor.loggingIn()) {
				this.isAdmin = false;
			}else{
				this.loginManager.logout();
				this.router.navigate(['/admin']);
			}
		});
	}



	ngOnDestroy() {
		if(this.tripsSub){
			this.tripsSub.unsubscribe();
		}
		if(this.cancelledTripsSub){
			this.cancelledTripsSub.unsubscribe();
		}
	}

	logout() {
		this.loginManager.logout();
	}

}
