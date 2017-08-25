import { Component, OnInit, OnDestroy, ViewChild, NgZone } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor-client';
declare var Meteor;
declare var _;

import { MeteorObservable } from 'meteor-rxjs'
import {NavController, NavParams, ViewController, LoadingController, Searchbar} from 'ionic-angular';

import { UserPlaces, Trips } from "../../shared/collections";

declare var google;
declare var navigator;

interface ServerResponse {
	status: number;
	message: string;
}

@Component({
  selector: 'search-location',
  templateUrl: 'search-location.component.mobile.html'
})
export class SearchLocationMobileComponent implements OnInit, OnDestroy {

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
  favoriteItems;
	favoriteItemsIds;
	recentItems;
	hideToolbar: boolean;

	currentPosition: any;

  userPlacesSub;
	recentPlacesSub;

	constructor(private navCtrl: NavController, navParams: NavParams, private zone: NgZone, private viewCtrl: ViewController, private loadingCtrl: LoadingController) {

		this.currentPosition = navParams.get("geolocation");
		this.map = navParams.get("map");
		this.targetValue = navParams.get("targetValue");
		this.fromLocation = navParams.get("fromLocation");
		this.location_option = 'near';

    this.favoriteItems = [];
		this.recentItems = [];
    this.userPlacesSub = MeteorObservable.subscribe('user-places').subscribe(() => {
				let userplaces = UserPlaces.find({user_id: Meteor.userId()});
				this.favoriteItems = userplaces.zone();
        this.favoriteItemsIds = userplaces.fetch().map(item => item.place_id);

		});

		this.recentPlacesSub = MeteorObservable.subscribe('trips', {}, true).subscribe(() => {

			let trips = Trips.find({
				'driver_id': Meteor.userId()
			}).fetch();

			this.recentItems = trips.map((trip: any) => {
				let place = trip.destination;
				place.description = place.name;
				place.name = place.shortName;
				place.favicon = this.favoriteItemsIds && this.favoriteItemsIds.indexOf(place.place_id) > -1;
				return place;
			});
			this.recentItems = this.uniq(this.recentItems, 'place_id');

		});

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

	ngOnDestroy() {

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
			this.nearByItems.forEach((item) => {
        item.favicon = this.favoriteItemsIds && this.favoriteItemsIds.indexOf(item.place_id) > -1;
				item.description = item.name;
      });
		} else {
			alert("constraint error");
		}

	}

	autocompleteLocation(event: any) {
    this.hideToolbar = true;
    this.location_option = 'near';
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
							me.autocompleteItems.forEach((item) => {
                item.favicon = me.favoriteItemsIds && me.favoriteItemsIds.indexOf(item.place_id) > -1;
                item.name = item.terms[0].value;
              });
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
    let me = this;
    MeteorObservable.call(!me.nearByItems[index].favicon ? 'addUserPlace' : 'removeUserPlace', Meteor.userId(), me.nearByItems[index]).subscribe((response: ServerResponse) => {
      if(response.status == 200){
        me.nearByItems[index].favicon = !me.nearByItems[index].favicon;
        if(me.nearByItems[index].favicon){
          me.favoriteItemsIds.push(me.nearByItems[index].place_id);
        }else{
          this.favoriteItemsIds = this.favoriteItemsIds.filter(i => i!==me.nearByItems[index].place_id);
        }
      }
		});
	}

	saveFavoriteLocation(index: number) {
    let me = this;
    MeteorObservable.call(!me.autocompleteItems[index].favicon ? 'addUserPlace' : 'removeUserPlace', Meteor.userId(), me.autocompleteItems[index]).subscribe((response: ServerResponse) => {
      if(response.status == 200){
        me.autocompleteItems[index].favicon = !me.autocompleteItems[index].favicon;
      }
      if(me.autocompleteItems[index].favicon){
        me.favoriteItemsIds.push(me.autocompleteItems[index].place_id);
      }else{
        this.favoriteItemsIds = this.favoriteItemsIds.filter(i => i!==me.autocompleteItems[index].place_id);
      }
    });
	}

	saveRecentFavoriteLocation(index: number) {
    let me = this;
    MeteorObservable.call(!me.recentItems[index].favicon ? 'addUserPlace' : 'removeUserPlace', Meteor.userId(), me.recentItems[index]).subscribe((response: ServerResponse) => {
      if(response.status == 200){
        me.recentItems[index].favicon = !me.recentItems[index].favicon;
      }
      if(me.recentItems[index].favicon){
        me.favoriteItemsIds.push(me.recentItems[index].place_id);
      }else{
        this.favoriteItemsIds = this.favoriteItemsIds.filter(i => i!==me.recentItems[index].place_id);
      }
    });
	}

  removeFavoriteLocation(item: any) {
    let me = this;
    MeteorObservable.call('removeUserPlace', Meteor.userId(), item).subscribe((response: ServerResponse) => {
      if(response.status == 200){
        this.favoriteItemsIds = this.favoriteItemsIds.filter(i => i!==item.place_id);
        me.nearByItems.forEach((it) => {
          it.favicon = this.favoriteItemsIds && this.favoriteItemsIds.indexOf(it.place_id) > -1;
        });
				me.recentItems.forEach((it) => {
          it.favicon = this.favoriteItemsIds && this.favoriteItemsIds.indexOf(it.place_id) > -1;
        });
      }
    });
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

	uniq (a, param){
      return a.filter(function(item, pos, array){
          return array.map(function(mapItem){ return mapItem[param]; }).indexOf(item[param]) === pos;
      })
  }

	stopTab(e){
		var evt = e || window.event
    if ( evt.keyCode === 9 ) {
        return false;
    }
	}
}
