import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor/meteor';
// import { _ } from 'underscore';
declare var Meteor;
declare var _;

import { FormGroup, FormBuilder } from '@angular/forms';
import { NavController, NavParams, ViewController, AlertController,
		LoadingController, PopoverController, ModalController, ActionSheetController, Platform} from 'ionic-angular';
import { MeteorObservable } from "meteor-rxjs"

import { Camera } from '@ionic-native/camera';

import { upload } from '../../classes/images.methods';

import { DOCTYPES, DRIVER_STATUS, USER_STATUS } from '../../shared/models';

interface ServerResponse {
	status: number;
	message: string;
}

@Component({
  selector: 'upload-documents',
  templateUrl: 'upload-documents.component.mobile.html'
})
// TODO:
// @InjectUser('user')
export class UploadDocumentsMobileComponent implements OnInit, OnDestroy {

	isPushNav: boolean;

	myformGroup: FormGroup;

	dataFile: File;
	dataURL;
	uploadedFile;

	loader;

	isDriver: boolean;
	verifyRegister: boolean;

	user: any;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController, private camera: Camera,
		private alertCtrl: AlertController, private loadingCtrl: LoadingController, private formBuilder: FormBuilder,
		private modalCtrl: ModalController, private popoverCtrl: PopoverController, private actionSheetCtrl: ActionSheetController,
		private platform: Platform) {

		this.isPushNav = navParams.get("isPushNav");
		this.isDriver = Meteor.user()['personData'].isDriver;
		this.verifyRegister = false;
		if(this.isDriver){
			this.verifyRegister = navParams.data.verifyRegister;
		}
	}

	isDevMode() {
		return isDevMode();
	}

	isMobile() {
		return this.platform.is('cordova');
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
		if(event.srcElement){
			this.dataFile = event.srcElement.files[0];
		}else{
			this.dataFile = event.target.files[0];
		}
		console.log(this.dataFile);
		let reader = new FileReader();

        reader.onload = function (e) {
        	me.uploadedFile = e.target['result'];
        };

        reader.readAsDataURL(this.dataFile);
	}

	showUploadOptions() {

		let actionSheet = this.actionSheetCtrl.create({
	     title: 'Subir Comprobante',
	     buttons: [
	       {
	         text: 'Tomar Foto',
	         role: 'destructive',
	         icon: 'camera',
	         handler: () => {
	           this.capturePhoto(this.camera.PictureSourceType.CAMERA, true);
	         }
	       },
	       {
	         text: 'Abrir Fototeca',
	         role: 'destructive',
	         icon: 'images',
	         handler: () => {
	           this.capturePhoto(this.camera.PictureSourceType.PHOTOLIBRARY);
	         }
	       }
	     ]
	   });

	   actionSheet.present();
	}

	capturePhoto(sourceType: any, isCamera?: boolean) {

		let cameraOptions = {};

		if(!this.platform.is('android')) {
			cameraOptions = {
				sourceType: sourceType,
				// destinationType: Camera.DestinationType.FILE_URI,
				quality: 40,
				encodingType: this.camera.EncodingType.JPEG,
				correctOrientation: true,
				saveToPhotoAlbum: isCamera
			}
		} else {
			cameraOptions = {
				sourceType: sourceType,
				destinationType: this.camera.DestinationType.FILE_URI,
				quality: 40,
				targetWidth: 500,
				targetHeight: 500,
				encodingType: this.camera.EncodingType.JPEG,
				correctOrientation: true,
				saveToPhotoAlbum: isCamera
			}
		}


		  this.camera.getPicture(cameraOptions).then((file_uri) => {

		  	this.loader = this.loadingCtrl.create({
		      content: "Cargando...",
		      spinner: "crescent"
		    });
	    	this.loader.present();

		  	// this.dataURL = "http://localhost:12664/local-filesystem/" + file_uri.substr(8);
		  	this.dataURL = file_uri;

			let xhr = new XMLHttpRequest();
			xhr.open("GET", this.dataURL);
			xhr.responseType = "blob";
			xhr.onload = () => {
			    this.uploadedFile = xhr.response;
			    this.uploadedFile.name = 'voucher' + new Date().toISOString() + '.jpeg';
			    this.loader.dismiss();
			}
			xhr.send();

		  }).catch((err) => {
		  	console.log("Error capturing photo on this device! " + err);
		  });
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

		upload(this.isMobile() ? this.uploadedFile:this.dataFile, Meteor.userId(), doc_type, '').then(() => {
    	if(this.isDriver) {
    		let driverData = Meteor.user()["driverData"];
				if(driverData.status == DRIVER_STATUS.UNVERIFIED) {
					driverData.status = DRIVER_STATUS.UPLOADED_ONE;
				} else if( driverData.status == DRIVER_STATUS.UPLOADED_ONE ){
					driverData.status = DRIVER_STATUS.UPLOADED_TWO;
				}
				Meteor.users.update({_id: Meteor.userId()}, {$set: {'driverData': driverData}});
    	} else {
    		let person = Meteor.user()["personData"];
    		person.status = USER_STATUS.UPLOADED_DNI;
    		Meteor.users.update({_id: Meteor.userId()}, {$set: {'personData': person}});
    	}
    	let alert = this.alertCtrl.create({
	      'title': title,
	      'subTitle': '¡El documento ha sido enviado exitosamente!',
	      buttons: [
	      {
	      	text: 'OK',
	      	handler: () => {
	      		loader.dismiss();
      			this.viewCtrl.dismiss();
	      	}
	  	  }]
	    });
    	alert.present();
		}).catch((error) => {
			loader.dismiss();
			alert('Error interno. Por favor intenta de nuevo.' + error);

		});
	}
}
