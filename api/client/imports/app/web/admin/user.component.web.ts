import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription, Subject } from "rxjs";
import { FormsModule }   from '@angular/forms';
import { MeteorObservable } from "meteor-rxjs";
import { Router, ActivatedRoute } from '@angular/router';

import { _ } from 'underscore';

import { BsDropdownModule } from 'ngx-bootstrap';

import { Images } from '../../../../../both/collections/images.collection';
import { Image, DOCTYPES } from '../../../../../both/models/image.model';

import { FacebookLoginManager } from '../../shared-components/login/facebook-login.class';

import template from './user.component.web.html';
import style from './user.component.web.scss';

interface ServerResponse {
	status: number;
	message: string;
}

interface UserResponse {
	status: number;
	message: string;
	user: any;
}

@Component({
  selector: 'user',
  template,
  styles: [ style ],
  providers: [ FacebookLoginManager ]
})

export class UserComponent implements OnInit, OnDestroy {

	autoSub: Subscription;
	isAdmin: boolean;
	user: any;
	sruser: any;

	user_id: string;

	constructor(private loginManager: FacebookLoginManager, private router: Router, private route: ActivatedRoute) {

	}

	ngOnInit() {
		this.autoSub = MeteorObservable.autorun().subscribe(() => {
			this.user = Meteor.user();
			if(this.user && !Meteor.loggingIn()) {
				this.autoSub = this.route.params.subscribe((params) => {
					this.user_id = params['id'];
					MeteorObservable.call('getUser', this.user_id).subscribe((response: UserResponse) => {
				      	if(this.isAdmin = response.status == 200){
							this.sruser = response.user;
							this.dniSub = MeteorObservable.subscribe("images").subscribe(() => {
								this.dniObs = Images.find({'user_id': this.sruser._id, 'doc_type': DOCTYPES.DNI, 'processed': true}).zone();
							});

							this.licenseSub = MeteorObservable.subscribe("images").subscribe(() => {
								this.licenseObs = Images.find({'user_id': this.sruser._id, 'doc_type': DOCTYPES.LICENSE, 'processed': true}).zone();
							});

							this.registerSub = MeteorObservable.subscribe("images").subscribe(() => {
								this.registerObs = Images.find({'user_id': this.sruser._id, 'doc_type': DOCTYPES.CAR_REGISTER, 'processed': true}).zone();
							});
						}else{
							this.loginManager.logout();
							this.router.navigate(['/admin']);
						}
				    });
				});
			}else if(Meteor.loggingIn()) {
				this.isAdmin = false;
			}else			{
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
