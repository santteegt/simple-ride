import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor/meteor';
// import { InjectUser } from "angular2-meteor-accounts-ui";
// import { _ } from 'underscore';
declare var Meteor;
declare var _;
import { NavController, NavParams, ViewController, AlertController, Platform,
		LoadingController, PopoverController, ModalController, ActionSheetController} from 'ionic-angular';
import { MeteorObservable } from "meteor-rxjs"

import { Camera } from '@ionic-native/camera';

import { upload } from '../../classes/images.methods';

import{ Reservation, DOCTYPES } from '../../shared/models';

interface ServerResponse {
	status: number;
	message: string;
}

@Component({
  selector: 'upload-deposit',
  templateUrl: 'upload-deposit-voucher.component.mobile.html',
  // styles: [ style ]
})
// @InjectUser('user')
export class UploadDepositVoucherMobileComponent implements OnInit, OnDestroy {

	isPushNav: boolean;

	rsvp: Reservation;
	dataFile: File;
	dataURL;
	uploadedFile;

	loader;

	user: any;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private alertCtrl: AlertController, private loadingCtrl: LoadingController,
		private modalCtrl: ModalController, private popoverCtrl: PopoverController, private actionSheetCtrl: ActionSheetController,
		private camera: Camera, private platform: Platform) {

		this.rsvp = navParams.get("rsvp");
		this.isPushNav = navParams.get("isPushNav");

		// this.card = "reservations";
		// this.trips = [];
		// this.drivers = [];
		// this.showDetail = [];

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

	ionViewWillEnter() {
		if(this.rsvp.payment_comments) {
			let alert = this.alertCtrl.create({
		      title: 'Error en su comprobante de pago!',
		      subTitle: 'El último comprobante de pago no fue procesado debido a: ' + this.rsvp.payment_comments,
		      buttons: [
		      {
		      	text: 'OK',
		      	handler: () => {

		      	}
		  	  }]
		    });
		    alert.present();
		}
	}

	ngOnDestroy() {

	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	getFile(event: any) {
		
		console.log(event.srcElement.files);
		this.dataFile = event.srcElement.files[0];
		console.log(this.dataFile);
		let reader = new FileReader();

        reader.onload = (e) => {
        	this.uploadedFile = e.target['result'];
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

		let cameraOptions = {
			// sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			sourceType: sourceType,
			destinationType: this.camera.DestinationType.FILE_URI,
			// destinationType: Camera.DestinationType.DATA_URL,
			quality: 40,
			// targetWidth: 1000,
			// targetHeight: 1000,
			encodingType: this.camera.EncodingType.JPEG,
			correctOrientation: true,
			saveToPhotoAlbum: isCamera
		}


		this.camera.getPicture(cameraOptions).then((file_uri) => {

			this.loader = this.loadingCtrl.create({
			  content: "Cargando...",
			  spinner: "crescent"
			});
			this.loader.present();

			console.log(file_uri);

			// this.dataURL = "http://localhost:12664/local-filesystem/" + file_uri.substr(8);
			this.dataURL = file_uri;

			let xhr = new XMLHttpRequest();
			xhr.open("GET", this.dataURL);
			xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
			xhr.onload = () => {
			    this.uploadedFile = xhr.response;//xhr.response is now a blob object
			    this.uploadedFile.name = 'voucher' + new Date().toISOString() + '.jpeg';
			    this.loader.dismiss();
			}
			xhr.send();
		
	  		// window['resolveLocalFileSystemURL'](file_uri, function success(fileEntry) {
		  	// 	fileEntry.file(function(file) {
		  	// 		me.dataFile = file;
		  	// 		console.log(me.dataFile);
		  	// 		// me.loader.dismiss();
		  	// 	});
     		// });
		
	  	}).catch((err) => {
		  	// alert("Error capturing photo on this device! " + err);
	  	});
	}

	uploadDeposit() {

		let loader = this.loadingCtrl.create({
		  content: "Procesando...",
		  spinner: "crescent"
		});
		loader.present();

		let doc_type = DOCTYPES.DEPOSIT_VOUCHER;

	    upload(this.isMobile() ? this.uploadedFile:this.dataFile, Meteor.userId(), doc_type, this.rsvp._id).then(() => {
			
			MeteorObservable.call('processPayment', 'deposit', this.rsvp._id).subscribe((response: ServerResponse) => {
				if(response.status == 200) {
					loader.dismiss();
					let alert = this.alertCtrl.create({
				      'title': 'Depósito Bancario',
				      'subTitle': 'El documento ha sido enviado exitosamente!',
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
				} else {
					loader.dismiss();
					alert('Something went wrong! Try again. ' + response.message);
				}
			});
	    
		}).catch((error) => {
			loader.dismiss();
			alert('Something went wrong! Try again. ' + error);
		
		});

	}

}
