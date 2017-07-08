import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor/meteor';
// import { InjectUser } from "angular2-meteor-accounts-ui";
// import { _ } from 'underscore';
declare var Meteor;
declare var _;

import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { NavController, NavParams, ViewController, AlertController,
		LoadingController, PopoverController, ModalController, ActionSheetController} from 'ionic-angular';
import { Observable, Subscription, Subject } from "rxjs";
import { MeteorObservable } from "meteor-rxjs"

// TODO: migrate Camera
// import { Camera } from 'ionic-native';

import { TripUtils } from '../../classes/trip-utils.class';
// TODO: migrate method
// import { upload } from '../../../../../../both/methods/images.methods';

import { DOCTYPES, DRIVER_STATUS, USER_STATUS } from '../../shared/models';

interface ServerResponse {
	status: number;
	message: string;
}

@Component({
  selector: 'upload-documents',
  templateUrl: 'user-documents.component.mobile.html'
})
// TODO:
// @InjectUser('user')
export class UserDocumentsMobileComponent implements OnInit, OnDestroy {

	isPushNav: boolean;

	myformGroup: FormGroup;

	dataFile: File;
	dataURL;
	uploadedFile;

	loader;

	isDriver: boolean;
	verifyRegister: boolean;

	user: any;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private alertCtrl: AlertController, private loadingCtrl: LoadingController, private formBuilder: FormBuilder,
		private modalCtrl: ModalController, private popoverCtrl: PopoverController, private actionSheetCtrl: ActionSheetController) {

		this.isPushNav = navParams.get("isPushNav");
		this.isDriver = Meteor.user()['personData'].isDriver;
		this.verifyRegister = false;
		if(this.isDriver && (Meteor.user()['driverData'].status == DRIVER_STATUS.UNVERIFIED_REGISTER || Meteor.user()['driverData'].status == DRIVER_STATUS.UPLOADED_LICENSE)){
			this.verifyRegister = true;
		}
	}

	isDevMode() {
		return isDevMode();
	}

	isMobile() {
		return Meteor.isCordova;
	}

	ngOnInit() {
		MeteorObservable.autorun().subscribe(() => {
      this.user = Meteor.user();
    });
	}

	ngOnDestroy() {

	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	getFile(event: any) {
		const me = this;
		console.log(event.srcElement.files);
		this.dataFile = event.srcElement.files[0];
		console.log(this.dataFile);
		let reader = new FileReader();

        reader.onload = function (e) {
        	me.uploadedFile = e.target['result'];
        };

        reader.readAsDataURL(this.dataFile);
	}

	showUploadOptions() {
		// TODO: migrate Camera
		// let actionSheet = this.actionSheetCtrl.create({
	  //    title: 'Subir Comprobante',
	  //    buttons: [
	  //      {
	  //        text: 'Tomar Foto',
	  //        role: 'destructive',
	  //        icon: 'camera',
	  //        handler: () => {
	  //          this.capturePhoto(Camera.PictureSourceType.CAMERA, true);
	  //        }
	  //      },
	  //      {
	  //        text: 'Abrir Fototeca',
	  //        role: 'destructive',
	  //        icon: 'images',
	  //        handler: () => {
	  //          this.capturePhoto(Camera.PictureSourceType.PHOTOLIBRARY);
	  //        }
	  //      }
	  //    ]
	  //  });
		//
	  //  actionSheet.present();
	}

	capturePhoto(sourceType: any, isCamera?: boolean) {
		// TODO: migrate Camera
		// const me = this;
		//  let cameraOptions = {
		//     sourceType: sourceType,
		//     destinationType: Camera.DestinationType.FILE_URI,
		//     quality: 60,
		//     encodingType: Camera.EncodingType.JPEG,
		//     correctOrientation: true,
		//     saveToPhotoAlbum: isCamera
		//   }
		//
		//
		//   Camera.getPicture(cameraOptions).then((file_uri) => {
		//
		//   	this.loader = this.loadingCtrl.create({
		//       content: "Cargando...",
		//       spinner: "crescent"
		//     });
	  //   	this.loader.present();
		//
		//   	this.dataURL = "http://localhost:12664/local-filesystem/" + file_uri.substr(8);
		//
		// 	let xhr = new XMLHttpRequest();
		// 	xhr.open("GET", this.dataURL);
		// 	xhr.responseType = "blob";
		// 	xhr.onload = function() {
		// 	    me.uploadedFile = xhr.response;
		// 	    me.uploadedFile.name = 'voucher' + new Date().toISOString() + '.jpeg';
		// 	    me.loader.dismiss();
		// 	}
		// 	xhr.send();
		//
		//   }).catch((err) => {
		//   	console.log("Error capturing photo on this device! " + err);
		//   });
	}

	uploadDocument() {
		let loader = this.loadingCtrl.create({
		  content: "Procesando...",
		  spinner: "crescent"
		});
		let doc_type = !this.isDriver ? DOCTYPES.DNI: (this.verifyRegister ? DOCTYPES.CAR_REGISTER : DOCTYPES.LICENSE)
		loader.present();
		let title = '';
		switch(doc_type){
			case DOCTYPES.DNI: title = 'Cédula de Identidad';
					break;
			case DOCTYPES.LICENSE: title = 'Licencia de Conducir';
					break;
			case DOCTYPES.CAR_REGISTER: title = 'Matricula del vehículo';
					break;
			default: break;
		}
		// 		TODO: migrate upload
		// 		upload(this.isMobile() ? this.uploadedFile:this.dataFile, Meteor.userId(), doc_type, '').then(() => {
    //     	if(this.isDriver){
    //     		let driverData = Meteor.user()["driverData"];
		// 		if(!this.verifyRegister){
		// 			driverData.status = DRIVER_STATUS.UPLOADED_LICENSE;
		// 		}else{
		// 			driverData.status = DRIVER_STATUS.UPLOADED_REGISTER;
		// 		}
		// 		Meteor.users.update({_id: Meteor.userId()}, {$set: {'driverData': driverData}});
    //     	}else{
    //     		let person = Meteor.user()["personData"];
    //     		person.status = USER_STATUS.UPLOADED_DNI;
    //     		Meteor.users.update({_id: Meteor.userId()}, {$set: {'personData': person}});
    //     	}
    //     	let alert = this.alertCtrl.create({
		//       'title': title,
		//       'subTitle': 'El documento ha sido enviado exitosamente!',
		//       buttons: [
		//       {
		//       	text: 'OK',
		//       	handler: () => {
		//       		loader.dismiss();
	  //     			this.viewCtrl.dismiss();
		//       	}
		//   	  }]
		//     });
		//     alert.present();
		// }).catch((error) => {
		// 	loader.dismiss();
		// 	alert('Something went wrong! Try again. ' + error);
		//
		// });

	}

}
