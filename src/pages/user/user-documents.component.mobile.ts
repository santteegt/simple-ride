import { Component, OnInit, OnDestroy } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor/meteor';
// import { _ } from 'underscore';
declare var Meteor;
declare var _;

import { NavController, ViewController, LoadingController, ModalController, NavParams} from 'ionic-angular';
import { Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";

import { UploadDocumentsMobileComponent } from '../user/upload-documents.component.mobile';

import { Image } from '../../shared/models';
import { Images } from '../../shared/collections';

@Component({
  selector: 'user-documents',
  templateUrl: 'user-documents.component.mobile.html'
})
// TODO:
// @InjectUser('user')
export class UserDocumentsMobileComponent implements OnInit, OnDestroy {

  isDriver: boolean;
  user: any;
  dniStatus: number;
  licenceStatus: number;
  registerStatus: number;
  uploadDocuments: Component;

	imagesSub: Subscription;
	images: Image[];

	constructor(private navCtrl: NavController, private viewCtrl: ViewController, private loadingCtrl: LoadingController, private modalCtrl: ModalController, private navParams: NavParams) {

		this.isDriver = Meteor.user()['personData'].isDriver;
	    this.dniStatus = this.licenceStatus = this.registerStatus = 0;
	    this.uploadDocuments = UploadDocumentsMobileComponent;
	}

	ngOnInit() {

		MeteorObservable.autorun().subscribe(() => {
  			this.user = Meteor.user();
    	});

		if(this.imagesSub){
			this.imagesSub.unsubscribe();
		}

		this.imagesSub = MeteorObservable.subscribe('images', this.user._id).subscribe(() => {

      this.getCurrentStatus();

		});
	}

	ngOnDestroy() {
		this.imagesSub.unsubscribe();
	}

  dismiss() {
		this.viewCtrl.dismiss();
	}

	openPage(page: Component, params: any) {
		let modal = this.modalCtrl.create(page, params);
    modal.onDidDismiss(data => {
      this.getCurrentStatus();
    });
		modal.present();
	}

  getCurrentStatus() {
    let query = Images.find({doc_type: {$in: [1, 2, 3]}});
    let images = query.fetch();

    let dniDoc = _.filter(images, function(image) {
      return image.doc_type == 1;
    });

    if(dniDoc.length > 0) {
      this.dniStatus = dniDoc[dniDoc.length -1].processed == undefined ? 1 : ( dniDoc[dniDoc.length -1 ].processed ? 2 : 0 );
    }

    let licenceDoc = _.filter(images, function(image) {
      return image.doc_type == 2;
    });

    if(licenceDoc.length > 0) {
      this.licenceStatus = licenceDoc[licenceDoc.length - 1].processed == undefined ? 1 : ( licenceDoc[licenceDoc.length - 1].processed ? 2 : 0 );
    }

    let registerDoc = _.filter(images, function(image) {
      return image.doc_type == 3;
    });

    if(registerDoc.length > 0) {
      this.registerStatus = registerDoc[registerDoc.length - 1].processed == undefined ? 1 : ( registerDoc[registerDoc.length - 1].processed ? 2 : 0 );
    }
  }
}
