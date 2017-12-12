import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription, Subject } from "rxjs";
import { FormsModule }   from '@angular/forms';
import { MeteorObservable } from "meteor-rxjs"
// TODO:
// import { InjectUser } from "angular2-meteor-accounts-ui";
declare var Meteor;
import { Router } from "@angular/router"

import { FacebookLoginManager } from '../../shared-components/login/facebook-login.class';

import template from './login.component.web.html';
import style from './login.component.web.scss';

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
  selector: 'login',
  template,
  styles: [ style ],
  providers: [ FacebookLoginManager ]
})
// @InjectUser('user')
export class LoginComponent implements OnInit, OnDestroy {

	isAdmin: boolean;
	user: any;

	autoSub: Subscription;

	constructor(private loginManager: FacebookLoginManager) {

	}

	ngOnInit() {
		this.autoSub = MeteorObservable.autorun().subscribe(() => {
			this.user = Meteor.user();
			if(this.user){
				MeteorObservable.call('isAdmin').subscribe((response: ServerResponse) => {
					if(this.isAdmin = response.status == 200){
						//nothing to do
					}else{
						this.loginManager.logout();
					}
				});
			}
		});
	}

	ngOnDestroy() {

	}

	login() {
		this.loginManager.login().then(msg => {

		})
		.catch((error) => {
			console.log(error);
			alert(error);
		});
	}

	logout() {
		if(this.autoSub){
			this.autoSub.unsubscribe();
		}
		this.loginManager.logout();
	}

}
