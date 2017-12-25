import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription, Subject } from "rxjs";
import { FormsModule }   from '@angular/forms';
import { MeteorObservable } from "meteor-rxjs";
import { Router } from '@angular/router';

import { _ } from 'underscore';

import { BsDropdownModule } from 'ngx-bootstrap';

import { FacebookLoginManager } from '../../shared-components/login/facebook-login.class';

import template from './users.component.web.html';
import style from './users.component.web.scss';

interface ServerResponse {
	status: number;
	message: string;
}

interface UsersResponse {
	status: number;
	message: string;
	users: any;
}

@Component({
  selector: 'users',
  template,
  styles: [ style ],
  providers: [ FacebookLoginManager ]
})

export class UsersComponent implements OnInit, OnDestroy {

	autoSub: Subscription;
	isAdmin: boolean;
	user: any;
	users: any;
	totalUsers: number;
	totalDrivers: number;
	totalTravellers: number;

	dni: string;
	drivers: boolean;

	typeFilter: any;

	constructor(private loginManager: FacebookLoginManager, private router: Router) {

	}

	ngOnInit() {
		this.autoSub = MeteorObservable.autorun().subscribe(() => {
			this.user = Meteor.user();
			this.users = {};
			if(this.user && !Meteor.loggingIn()) {
				this.dni = null;
				this.drivers = null;
				MeteorObservable.call('getUsers', this.dni, this.drivers).subscribe((response: UsersResponse) => {
			      	if(this.isAdmin = response.status == 200){
						this.users = response.users;
						MeteorObservable.call('getTotalUsers').subscribe((response:UsersResponse) => {
							this.totalUsers = response.users.totalUsers;
							this.totalDrivers = response.users.totalDrivers;
							this.totalTravellers = response.users.totalTravellers;
						})
					}else{
						this.loginManager.logout();
						this.router.navigate(['/admin']);
					}
			    });
			}else if(Meteor.loggingIn()) {
				this.isAdmin = false;
			}else			{
				this.loginManager.logout();
				this.router.navigate(['/admin']);
			}
		});
	}

	updateUsers(){
		this.drivers = this.typeFilter == 'drivers' ? true : (this.typeFilter == 'travellers' ? false : null);
		MeteorObservable.call('getUsers', this.dni, this.drivers).subscribe((response: UsersResponse) => {
			if(this.isAdmin = response.status == 200){
				this.users = response.users;
			}else{
				this.loginManager.logout();
				this.router.navigate(['/admin']);
			}
		});
	}


	ngOnDestroy() {

	}

	logout() {
		this.loginManager.logout();
	}

}
