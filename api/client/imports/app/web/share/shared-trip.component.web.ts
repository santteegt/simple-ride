import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subscription, Subject } from "rxjs";
import { MeteorObservable } from "meteor-rxjs"
import { ActivatedRoute } from '@angular/router';
import { MetaConfig, MetaService } from 'ng2-meta';
import { _ } from 'underscore';

import { FacebookLoginManager } from '../../shared-components/login/facebook-login.class';

import { Images } from '../../../../../both/collections/images.collection';
import { Image } from '../../../../../both/models/image.model';
import { Reservations } from '../../../../../both/collections/reservations.collection';
import { Reservation, RESERVATIONSTATUS } from '../../../../../both/models/reservation.model';
import { Utils } from '../../shared/utils';


import template from './shared-trip.component.web.html';
import style from './shared-trip.component.web.scss';

interface Place {
	shortName: string;
}

interface Trip {
	'_id': string;
	'origin': Place;
  	'destination': Place;
	'departureDate': Date;
	'departureTime': string;
	'price': number;
	'available_places': number;
}

interface ServerResponse {
	processed: boolean;
	result: Trip;
}

@Component({
  selector: 'shared-trip',
  template,
  styles: [ style ],
})

export class SharedTripComponent implements OnInit, OnDestroy {

	trip_id: string;

	sub: Subscription;

	utils: Utils;

	@ViewChild('redirectURI') redirectAnchor: ElementRef;


	constructor(private route: ActivatedRoute, private metaService: MetaService) {

		this.utils = new Utils();

		this.sub = this.route.params.subscribe(params => {
	    	this.trip_id = params['id'];
	    	console.log(this.trip_id);
	    	MeteorObservable.call('getTripSharingDetails', this.trip_id).subscribe((response: ServerResponse) => {
	    		if(response.processed) {
	    			let trip = response.result;
	    			let description: string = 'Estoy viajando ' + trip.origin.shortName + ' - ' + trip.destination.shortName 
	    				+ ' el ' + this.utils.dateToString(trip.departureDate) + ' a las ' + trip.departureTime + '\n' +
	    				'Tengo ' + trip.available_places + ' lugar(es) aún disponibles. Reservalo ahora!';
	    			console.log(response.result);
		  	// 		this.metaService.setTitle('Simple Ride');
			  //   	this.metaService.setTag('og:title', 'Simple Ride');
					// this.metaService.setTag('og:description', description);
					// this.metaService.setTag('og:type', 'website');
					// this.metaService.setTag('og:locale', 'es_EC');
					// this.metaService.setTag('og:url', 'http://simpleride-ec.com');
					// this.metaService.setTag('og:image', document.baseURI + 'assets/sharing-image.png');
					// this.metaService.setTag('og:image:width', '192');
					// this.metaService.setTag('og:image:height', '192');
					// this.metaService.setTag('og:image:type', 'image/png');
					// this.metaService.setTag('fb:app_id', '210372952755567');
			    	this.metaService.setTag('og:title', 'Simple Ride');
					this.metaService.setTag('og:description', description);
					window['prerenderReady'] = true;
					console.log('prerenderReady: ' + window['prerenderReady']);
					
				} else {

				}
	  		});
	    	

	    });

	}

	ngOnInit() {


	}

	ngOnDestroy() {
		this.sub.unsubscribe();

	}

	ngAfterViewChecked() {
		console.log(this.redirectAnchor.nativeElement);

	}

	fireApp() {
		console.log(this.redirectAnchor);
		this.redirectAnchor.nativeElement.click();

	}

}