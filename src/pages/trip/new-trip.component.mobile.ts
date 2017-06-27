import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Meteor } from 'meteor/meteor';
import {NavController, NavParams, ViewController, ToastController, ModalController, Slides,
	AlertController, LoadingController, Content} from 'ionic-angular';

import { MeteorObservable } from "meteor-rxjs"

import { SearchLocationMobileComponent } from '../location/search-location.component.mobile';
import { TermsOfServiceMobileComponent } from "../terms/terms-service.component.mobile";
import { TripUtils } from '../../classes/trip-utils.class';

import { Trips, ChatMessages } from '../../../api/both/collections';
import{ MESSAGETYPES } from '../../../api/both/models';

declare var google;

interface ServerResponse {
	processed: boolean;
	result: Price;
}

interface Price {
	suggestedPrice: number;
	minPrice: number;
	maxPrice: number;
}

@Component({
  selector: 'new-trip',
  templateUrl: 'new-trip.component.mobile.html'
})
export class NewTripMobileComponent implements OnInit {

	@ViewChild('slider') slider: Slides;
	@ViewChild('departureDatetime') departureDatetime;
	@ViewChild(Content) content: Content;

	@ViewChild('map') mapElement: ElementRef; //that is why the use of #map
	map: any;
	showMap: boolean;
	directionsDisplay;

	originLoc: any;
	originLabel: string;
	destinationLoc: any;
	destinationLabel: string;

	searchLocationModal: Component;

	departureTime: string;
	minDate: Date;
	departureDate;

	price: number;
	places: number;
	handBaggage: boolean;
	baggage: boolean;
	pets: boolean;
	smoking: boolean;
	food: boolean;
	children: boolean;
	comments: string;
	departureAddress: string;

	estimatedTime: number;
	origin: string;
	destination: string;
	distance: number; // in meters
	duration: number; // in seconds
	suggestedPrice: number;
	minPrice: number;
	maxPrice: number;

	rsvpMethod: string;

	tripUtils = TripUtils;

	@ViewChild('priceinput') priceInput;

	currentPosition: any;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private formBuilder: FormBuilder, private toastCtrl: ToastController, private modalCtrl: ModalController,
		private alertCtrl: AlertController, private loadingCtrl: LoadingController) {

		this.currentPosition = navParams.get("geolocation");
		this.showMap = false;
		this.directionsDisplay = new google.maps.DirectionsRenderer;

		this.originLabel = '';
		this.destinationLabel = '';

		this.searchLocationModal = SearchLocationMobileComponent;

		this.departureTime = "" + new Date().getHours() + ":" + new Date().getMinutes();
		this.minDate = new Date();
		this.minDate.setDate(this.minDate.getDate() - 1);
		this.departureAddress = '';
		this.rsvpMethod = "1";

	}

	ngOnInit() {
		this.loadMap();

	}

	ionViewWillEnter() {
		// this.loadMap();
		this.slider.lockSwipes(true);

  	}

  	searchLocation(event: any, targetValue: string) {
			if(targetValue=='to' && !this.originLoc){
				return;
			}
	  	let modal = this.modalCtrl.create(this.searchLocationModal, {
	  		geolocation: this.currentPosition,
	  		map: this.map,
	  		targetValue: targetValue,
	  		fromLocation: this.originLabel
	  	});
			modal.onDidDismiss(data => {
				if(data) {
					if(targetValue == 'from') {
						this.originLoc = data;
						this.originLabel = this.originLoc.description;
					} else {
						this.destinationLoc = data;
						this.destinationLabel = this.destinationLoc.description;
						this.showMap = true;
						this.setTripRoute();
					}
				}
			});
			modal.present();
			// event.stopPropagation();
	}

	setOrigin() {
		let loader = this.loadingCtrl.create({
	      content: "Geolocalizando...",
	      spinner: "crescent"
	    });
	    loader.present();
		let me = this;
		let service = new google.maps.places.PlacesService(this.map);
        service.nearbySearch({
          location: this.currentPosition,
          radius: 50000,
          type: ['locality'],
          rankBy: google.maps.places.RankBy.PROMINENCE
        }, function(results, status) {
        	if(status == 'OK') {
        		console.log(results);
        		let item = results[0];
        		me.originLabel = item.name;
        		me.originLoc = {
					item: null,
					nitem: item,
					description: me.originLabel,
					place_id: item.place_id
				};
        	} else {
        		alert("Connection error");
        	}
			loader.dismiss();
        });
        this.destinationLabel = this.destinationLoc = null;
        this.directionsDisplay.setMap(null);

	}

  	loadMap(){

	    let latLng = new google.maps.LatLng(this.currentPosition.lat, this.currentPosition.lng);

	    let mapOptions = {
	      center: latLng,
	      zoom: 15,
	      mapTypeId: google.maps.MapTypeId.ROADMAP,
	      noClear: true,
	      disableDefaultUI: true
	    }

	    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

	}

	setTripRoute() {
		let directionsService = new google.maps.DirectionsService;
      let me = this;
     	this.directionsDisplay.setMap(this.map);
        directionsService.route({
          origin: {placeId: this.originLoc.place_id},
          destination: this.destinationLoc.description,
          travelMode: 'DRIVING'
        }, function(response, status) {
          if (status === 'OK') {
            me.directionsDisplay.setDirections(response);
            me.setSummaryFields(response);
          } else {
            alert('Directions request failed due to ' + status);
          }
        });
	}

	setSummaryFields(response: any) {
		let info = response.routes[0].legs[0];
		this.estimatedTime = info.duration.value;
		this.origin = info.start_address;
		this.origin = this.origin.substr(0, this.origin.indexOf(',') > 0 ? this.origin.indexOf(','):this.origin.length);
		this.destination = info.end_address;
		this.destination = this.destination.substr(0, this.destination.indexOf(',') > 0 ? this.destination.indexOf(','):this.destination.length);
		this.distance = info.distance.value;

		MeteorObservable.call('getSuggestedPrice', info.distance.value).subscribe((response: ServerResponse) => {
			if(response.processed) {
				this.suggestedPrice = response.result.suggestedPrice;
				this.minPrice = response.result.minPrice;
				this.maxPrice = response.result.maxPrice;
			} else {

			}
		});
	}

	nextStep() {
		// this.slider.slider.slideNext(true, 300);
		this.slider.lockSwipes(false);
		this.slider.slideNext(300);
		this.slider.lockSwipes(true);
	}

	prevStep() {
		// this.slider.slider.slidePrev(true, 300);
		this.slider.lockSwipes(false);
		this.slider.slidePrev(300);
		this.slider.lockSwipes(true);
	}

	dismiss() {
		let alert = this.alertCtrl.create({
			title: '¿Quieres salir?',
			subTitle: 'Al cerrar la ventana el viaje no se guardará.',
			buttons: [
				{
				text: 'No',
				handler: () => {
				}
				},
				{
				text: 'Si',
				handler: () => {
				this.viewCtrl.dismiss();
				}
			}]
		});
		alert.present();
	}

	termsOfService() {
		let modal = this.modalCtrl.create(TermsOfServiceMobileComponent);
    	modal.present();
	}

	saveTrip() {
		let confirm = this.alertCtrl.create({
		title: 'Confirmación de Viaje',
		message: '¿Está seguro que desea publicar este viaje?',
		buttons: [
		{
		  text: 'Aún no',
		  handler: () => {
		  }
		},
		{
		  text: 'Confirmar',
		  handler: () => {
		  	let loader = this.loadingCtrl.create({
		      content: "Guardando...",
		      spinner: "dots",
		      duration: 3000
		    });
		    loader.present();
		    const country_id = 'EC';
		  	let oitem = this.originLoc.item ? this.originLoc.item:this.originLoc.nitem;
		  	Meteor.call('registerPlace', oitem.place_id, {country_id: country_id, place_id: oitem.place_id,
		  		name: this.originLoc.description, shortName: this.origin});

		  	let ditem = this.destinationLoc.item ? this.destinationLoc.item:this.destinationLoc.nitem;
		  	Meteor.call('registerPlace', ditem.place_id, {country_id: country_id, place_id: ditem.place_id,
		  		name: this.destinationLoc.description, shortName: this.destination});

		  	let departureDate = this.departureDate.startDate;
		  	departureDate.setHours(this.departureTime.substr(0, this.departureTime.indexOf(':')));
		  	departureDate.setMinutes(this.departureTime.substr(this.departureTime.indexOf(':') + 1, this.departureTime.length));

		  	let rsObs = Trips.insert({
		  		driver_id: Meteor.userId(),
		  		creationDate: new Date(),
		  		country_id: 'EC',
				origin: {
					place_id: oitem.place_id,
					name: this.originLoc.description,
					shortName: this.origin
				},
				destination: {
					place_id: ditem.place_id,
					name: this.destinationLoc.description,
					shortName: this.destination
				},
				'departureDate': departureDate,
				departureTime: this.departureTime,
				price: Number(this.price),
				places: Number(this.places),
				distance: this.distance,
				estimatedTime: this.estimatedTime,
				available_places: Number(this.places),
				options: {
					handBaggage: this.handBaggage,
					baggage: this.baggage,
					pets: this.pets,
					smoking: this.smoking,
					food: this.food,
					children: this.children
				},
				rsvp_method: this.rsvpMethod,
				comments: this.comments,
				departureAddress: this.departureAddress

		  	});
		  	rsObs.subscribe((trip_id: string) => {
		  		let today = new Date();
		  		let hour = today.getHours() < 10 ? '0' + today.getHours():today.getHours();
      			let minutes = today.getMinutes() < 10 ? '0' + today.getMinutes():today.getMinutes();
		  		ChatMessages.insert({
		  			trip_id: trip_id,
					user_id: Meteor.userId(),
					user_forename: Meteor.user()['personData']['forename'],
					user_surname: Meteor.user()['personData']['surname'],
					user_profileImg: Meteor.user()['personData']['profileImg'],
					is_driver: true,
					message_type: MESSAGETYPES.SYSTEM,
					message_date: today,
					message_time: hour + ':' + minutes,
					message: Meteor.user()['personData']['forename'] + ' ha creado este viaje'

		  		});
		  		loader.dismiss();
		  		this.finishRegistration();
		  	});

		  }
		}
		]
		});
		confirm.present();

	}

	finishRegistration() {
		let alert = this.alertCtrl.create({
	      title: 'Nuevo Viaje a ' + this.destination + '!',
	      subTitle: 'Tu nuevo viaje ha sido publicado exitosamente!',
	      buttons: [
	      {
	      	text: 'OK',
	      	handler: () => {

	      	}
	  	  }]
	    });
	    alert.present();
	    this.viewCtrl.dismiss();
	}

	validatePrice(){
		if(this.price<this.minPrice || this.price>this.maxPrice){
			this.presentToast("El precio tiene que ser entre "+this.minPrice+" y "+this.maxPrice);
			this.price = undefined;
		}
	}

	validateSeats(){
		if(this.places>4){
			this.presentToast("No se pueden llevar más de 4 pasajeros");
			this.places = undefined;
		}
	}

	presentToast(message: string) {
		let toast = this.toastCtrl.create({
			message: message,
			position: 'top',
			duration: 3000
		});
		toast.present();
	}

	focusPrice() {
		this.priceInput.setFocus();
	}

}
