import { Component, OnInit, OnDestroy, ViewChild, NgZone } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor-client';
declare var Meteor;
import {NavController, NavParams, ViewController, LoadingController, Searchbar} from 'ionic-angular';

declare var google;
declare var navigator;

@Component({
  selector: 'search-location',
  templateUrl: 'search-location.component.mobile.html'
})
export class SearchLocationMobileComponent implements OnInit {

	@ViewChild('searchbar') searchBar: Searchbar;

	searchInput: HTMLInputElement;
	// autocomplete: any;

	location_option: string;
	map: any;
	targetValue: string;
	fromLocation: string;

	nearByItems;

	service = new google.maps.places.AutocompleteService();
	autocomplete;
	autocompleteItems;
	hideToolbar: boolean;

	currentPosition: any;

	constructor(private navCtrl: NavController, navParams: NavParams, private zone: NgZone, private viewCtrl: ViewController, private loadingCtrl: LoadingController) {
		
		this.currentPosition = navParams.get("geolocation");
		this.map = navParams.get("map");
		this.targetValue = navParams.get("targetValue");
		this.fromLocation = navParams.get("fromLocation");
		this.location_option = 'near';

		console.log(this.fromLocation);
		if(this.targetValue == 'from') {
			this.getNearByLocations();
		}

		this.autocomplete = {
			query: ''
		};
		this.autocompleteItems = [];
		this.hideToolbar = false;

	}

	ngOnInit() {
		// this.searchInput = <HTMLInputElement>document.getElementsByClassName("searchbar-input")[0]
		// this.autocomplete = new google.maps.places.Autocomplete(
  //           /** @type {!HTMLInputElement} */(this.searchInput),
  //           {types: ['geocode']});

        // When the user selects an address from the dropdown, populate the address
        // fields in the form.
        // this.autocomplete.addListener('place_changed', this.setTargetAddress);

	}

	getNearByLocations() {
    let loader = this.loadingCtrl.create({
      content: "Cargando...",
      spinner: "crescent"
    });
    loader.present();
		let me = this;
		let service = new google.maps.places.PlacesService(this.map);
        service.nearbySearch({
          location: this.currentPosition,
          radius: 50000,
          type: ['locality'],
          // rankBy: google.maps.places.RankBy.DISTANCE
          rankBy: google.maps.places.RankBy.PROMINENCE
        }, function(results, status) {
        	me.setNearByLocations(results, status);
          loader.dismiss();
        });
	}

	setNearByLocations(results, status) {
		if(status == 'OK') {
			this.nearByItems = results;
			this.nearByItems.forEach((item) => item.favicon = false);
			console.log(this.nearByItems);
		} else {
			alert("constraint error");
		}

	}

	autocompleteLocation(event: any) {
    this.hideToolbar = true;
		if (this.autocomplete.query == '') {
	      this.autocompleteItems = [];
	      return;
	    }
	    let me = this;
	    this.service.getPlacePredictions({
	    		input: this.autocomplete.query,
	    		componentRestrictions: {country: 'EC'},
	    		types: ['(cities)']
	    	}, function (predictions, status) {
	    		switch (status) {
	    			case "OK":
	    				me.autocompleteItems = predictions.filter((item) =>
	    					item.description.indexOf(me.fromLocation) == -1 || me.fromLocation.length == 0
    					);
		      			me.autocompleteItems.forEach((item) => item.favicon = false);
	    				break;
	    			case "ZERO_RESULTS":
	    				me.autocompleteItems = [];
	    				break;
	    			case "UNKNOWN_ERROR":
	    				alert('Error en la búsqueda!. Es necesario estar conectado a internet');
	    			default:
	    				alert('constraint error ' + status);
	    				break;
	    		}

	    });

	}

	hiddenToolbar(hide: boolean) {
		this.location_option = 'near';
		this.hideToolbar = hide;

	}

	onCancel(event: any) {
		this.hiddenToolbar(false);
	}

	selectNearbyLocation(item: any) {
		let data = {
			item: null,
			nitem: item,
			description: item.name,
      place_id: item.place_id
		};
		this.dismiss(data);
	}

	selectLocation(item: any) {
		let data = {
			item: item,
			nitem: null,
			description: item.description,
      place_id: item.place_id
		};
		this.dismiss(data);

	}

	saveNBFavoriteLocation(index: number) {
		this.nearByItems[index].favicon = !this.nearByItems[index].favicon;
	}

	saveFavoriteLocation(index: number) {
		this.autocompleteItems[index].favicon = !this.autocompleteItems[index].favicon;
	}

	// setTargetAddress() {
	// 	let place = this.autocomplete.getPlace();
	// 	console.log(place.address_components);
	// }

	dismiss(data: any) {
   		this.viewCtrl.dismiss(data);
	}

  ionViewDidEnter() {
    setTimeout(() => {
      this.searchBar.setFocus();
    }, 150);
  }
}
