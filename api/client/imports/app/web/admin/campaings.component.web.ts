import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription, Subject } from "rxjs";
import { FormsModule }   from '@angular/forms';
import { MeteorObservable } from "meteor-rxjs";
import { Router } from '@angular/router';

// TODO:
// import { InjectUser } from "angular2-meteor-accounts-ui";
import { _ } from 'underscore';

import { TabsetComponent, BsDropdownModule } from 'ngx-bootstrap';

import { Campaings } from '../../../../../both/collections/campaings.collection';

import { FacebookLoginManager } from '../../shared-components/login/facebook-login.class';

import template from './campaings.component.web.html';
import style from './campaings.component.web.scss';

interface ServerResponse {
	status: number;
	message: string;
}

@Component({
  selector: 'campaings',
  template,
  styles: [ style ],
  providers: [ FacebookLoginManager ]
})
// @InjectUser('user')
export class CampaingsComponent implements OnInit, OnDestroy {

	@ViewChild('documents') staticTabs: TabsetComponent;

	autoSub: Subscription;
	isAdmin: boolean;
	user: any;

	title: any;
	message: any;
	audience: any;

	totalDrivers: number;
	totalTravellers: number;

	campaingsSub: Subscription;
	campaingsObs: any;

	constructor(private loginManager: FacebookLoginManager, private router: Router) {
		this.audience = 'all';
	}

	ngOnInit() {
		this.autoSub = MeteorObservable.autorun().subscribe(() => {
			this.user = Meteor.user();
			if(this.user && !Meteor.loggingIn()){
				MeteorObservable.call('isAdmin', this.user._id).subscribe((response: ServerResponse) => {
		      if(this.isAdmin = response.status == 200){
						this.campaingsSub = MeteorObservable.subscribe('campaings').subscribe(() => {
							this.campaingsObs = Campaings.find({}).zone();
						});
						MeteorObservable.call('getTotalUsers').subscribe((response: any) => {
							this.totalDrivers = response.users.totalDrivers;
							this.totalTravellers = response.users.totalTravellers;
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

	addCampaing(){
		MeteorObservable.call('addCampaing', this.audience, this.title, this.message).subscribe((rs) => {
			this.title = "";
			this.message = "";
		});
	}

	deleteCampaing(id){
		MeteorObservable.call('deleteCampaing', id).subscribe((rs) => {
		});
	}

	sendCampaing(id){
		MeteorObservable.call('sendCampaing', id).subscribe((rs) => {
			console.log(id);
		});
	}


	ngOnDestroy() {

	}

	logout() {
		this.loginManager.logout();
	}

}
