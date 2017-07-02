import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/core';
import { Platform, NavController, NavParams, ViewController, ModalController, LoadingController, 
  MenuController, AlertController } from 'ionic-angular';
import { Observable, Subscription, Subject } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";
import { StatusBar } from "@ionic-native/status-bar";
// TODO: 
// import { _ } from 'meteor/underscore';
declare var _;

// TODO: Migrate functionality
// import { Counts } from 'meteor/tmeasday:publish-counts';

import { Dashboard } from "../../classes/dashboard.class";
import { GeolocationService } from "../../classes/services/geolocation.service";
import { NewTripMobileComponent } from '../trip/new-trip.component.mobile';

// TODO: migrate components
// import { TripMobileComponent } from './pages/trip/trip.component.mobile';
// import { TripListMobileComponent } from './pages/trip/trip-list.component.mobile';
// import { TripMessageBoardMobileComponent } from './pages/trip/trip-message-board.component.mobile';
// import { UserNotificationsMobileComponent } from './pages/user/user-notifications.component.mobile';

import { Places, Trips } from '../../shared/collections';
import { Place, Trip } from '../../shared/models';

import { IsDriverPipe } from '../../classes/shared/is-driver.pipe';

declare var cordova;

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.mobile.html',
  providers: [GeolocationService, IsDriverPipe],
  animations: [
  	trigger('popSearchBox', [
      state('in', style({
        transform: 'translate3d(0,0,0)'
      })),
      transition('void => *', [
        animate('200ms 100ms ease-in', keyframes([
          style({transform: 'translate3d(0,-100px,0)', offset: 0}),
          style({transform: 'translate3d(0,10px,0)', offset: 0.9}),
          style({transform: 'translate3d(0,0,0)', offset: 1})
        ]))
      ]),
      transition('* => void', [
        animate('200ms 100ms ease-out', keyframes([
          style({transform: 'translate3d(0,0,0)', offset: 0}),
          style({transform: 'translate3d(0,-100px,0)', offset: 1})
        ]))
      ])
    ]),

    trigger('searchBoxHeight', [
      state('collapsed', style({
        // display: 'none',
        height: 0
      })),
      state('expand', style({
      	// display: 'block',
        height: '90px'
      })),
      transition('* => expand', [
        animate('200ms 100ms ease-in', keyframes([
          style({height: 0, offset: 0}),
          style({height: '45px', offset: 0.5}),
          style({height: '100px', offset: 0.9}),
          style({height: '90px', offset: 1})
        ]))
      ]),
      transition('expand => *', [
        animate('200ms 150ms ease-out', keyframes([
       	  style({height: '90px', offset: 0}),
       	  style({height: '45px', offset: 0.5}),
          style({height: 0, offset: 1}),



        ]))
      ])
    ])
  ]
})
export class DashboardMobileComponent extends Dashboard implements OnInit, OnDestroy {

  newTrip: Component = NewTripMobileComponent;
  // TODO: migrate components
	// tripDetail: Component = TripMobileComponent;

	placesSub: Subscription;
	places;

	myTripsSub: Subscription;
  // TODO:
	// mytrips: Observable<Trip[]>;
  mytrips: any;
  hasTrips: boolean;

	loader;

	tripsOverview: Trip[];
	placesOverview;

	autorunPlacesSub: Subscription;
	autorunSub: Subscription;

	searchBar: boolean;
	searchState: string = "in";
	boxHeightState: string = "collapsed";

	originSearch: string;
	destinationSearch: string;

  autorunSubC: Subscription;
  myNotifSub: Subscription;
  isDriverSub: Subscription;
  notificationsCount: number;

  // TODO:
  // hasTripsSub: Subscription;
  hasTripsSub: any;

  loadingImgs: any;

  user: any;

  constructor(private platform: Platform, private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
  	private modalCtrl: ModalController, private loadingCtrl: LoadingController, private menuCtrl: MenuController,
  	private geoService: GeolocationService, private isDriverPipe: IsDriverPipe, private alertCtrl: AlertController,
    private statusBar: StatusBar) {
    super("Hello mobile World!");

    this.searchBar = false;

    this.originSearch = '';
    this.destinationSearch = '';
    this.hasTrips = true;

    this.loadingImgs = {};

    this.platform.resume.subscribe((e: any) => {
      if(this.platform.is('cordova')) {
          this.validateGeolocation();
        }
    });

    if(this.platform.is('cordova')) {
      this.validateGeolocation();
    } else {
      this.loadGMapsScript('https://maps.google.com/maps/api/js?key=AIzaSyA4o5dp21Sdw7vyUO0iC5mua7f9gMx6_2w&libraries=places',
        () => {
          console.log('google api loaded');
          this.getCurrentGeolocation();
      });
    }
    // this.viewCtrl.showBackButton(false);
    // this.selectedItem = navParams.get('item');
  }

  loadGMapsScript(src: string, callback: any){
      if(!document.getElementById("googleapi")){
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.id = "googleapi";
        if(callback) script.onload = callback;
        document.getElementsByTagName("head")[0].appendChild(script);
        script.src = src;
      } else {
        this.getCurrentGeolocation();
      }
  }

  ngOnInit() {
    this.menuCtrl.enable(true);

    MeteorObservable.autorun().subscribe(() => {
      this.user = Meteor.user();
    });

    if(this.isDriverSub){
      this.isDriverSub.unsubscribe();
    }

    if (this.myTripsSub) {
      this.myTripsSub.unsubscribe();
    }

    this.isDriverSub = MeteorObservable.autorun().subscribe(() => {
      let is_driver = this.isDriverPipe.transform(Meteor.user());
      if(is_driver) {

        this.initDriverSettings();

      } else {

        this.loadingImgs = {};
        this.initUserSettings();

      }
    });

    if(this.autorunSubC) {
      this.autorunSubC.unsubscribe();
    }
    if(this.myNotifSub) {
      this.myNotifSub.unsubscribe();
    }

    // TODO: migrate functionality
    // this.myNotifSub = MeteorObservable.subscribe('notifications', Meteor.userId()).subscribe(() => {
    //   this.autorunSubC = MeteorObservable.autorun().subscribe(() => {
    //     this.notificationsCount = Counts.get('notificationsCount');
    //   });
    // });

    if(this.platform.is('cordova')) {
      this.statusBar.show();
    }

  }

  loadedPlaceImg(place_id: string) {
    console.log('loaded ' + this.loadingImgs[place_id]);
    this.loadingImgs[place_id] = true;
  }

  initDriverSettings() {

  	// const options: Options = {
  	const options = {
  		// limit: pageSize as number,
  		// skip: ((curPage as number) - 1) * (pageSize as number),
  		sort: {
  			departureDate: 1
  		}
  	};

  	this.myTripsSub = MeteorObservable.subscribe('trips', options, true).subscribe(() => {
      let trips = Trips.find({
              driver_id: Meteor.userId(),
  			cancellation_reason: undefined,
  			departureDate: {$gte: new Date()}
  		}, {sort: {departureDate: 1} });
      this.hasTrips = trips.fetch().length > 0;
      this.mytrips = trips.zone();
      if(this.hasTripsSub) {
        this.hasTripsSub.unsubscribe();
      }
      this.hasTripsSub = trips.subscribe((data: Trip[]) => {
        this.hasTrips = data && data.length > 0;
      });
  	});

  }

  initUserSettings() {
  	const me = this;



	if(this.autorunPlacesSub) {
		this.autorunPlacesSub.unsubscribe();
	}

	this.placesSub = MeteorObservable.subscribe('places').subscribe(() => {
		me.autorunPlacesSub = MeteorObservable.autorun().subscribe(() => {
			this.places = Places.find({}).fetch();
			this.getPlacesOverview();

		});

	});

  }

  getPlacesOverview() {

  	const me = this;

  	const options = {
  		// limit: pageSize as number,
  		// skip: ((curPage as number) - 1) * (pageSize as number),
  		sort: {
  			departureDate: 1
  		}
  	};

  	if(this.autorunSub) {
  		this.autorunSub.unsubscribe();
  	}

  	this.myTripsSub = MeteorObservable.subscribe('trips', options, false).subscribe(() => {

  		this.autorunSub = MeteorObservable.autorun().subscribe(() => {
  	  		let date = new Date();
  	  		const threshold = 30 * 60000; // 30 minutes ahead
  	  		date = new Date(date.getTime() + threshold);
  	  		let time = date.getHours().toString() + ':' + date.getMinutes().toString();

  			this.tripsOverview = Trips.find({
  				cancellation_reason: undefined,
  				departureDate: {$gte: date},
  				'origin.shortName': {$regex: this.originSearch + ".*", $options: 'i'},
  				'destination.shortName': {$regex: this.destinationSearch + ".*", $options: 'i'},
  				'available_places': {$gt: 0},
  				'driver_id': {$nin: [Meteor.userId()]}
  				// departureTime: {$gte: time}
  			}).fetch();

  			let trips_aggregate = _.countBy(this.tripsOverview, function (trip: Trip) {
  				return trip.destination.place_id;
  			});

  			// console.log(trips_aggregate);
  			this.placesOverview = _.map(trips_aggregate, function(count: number, place_id: string) {

  				let place = _.find(me.places, function(place) { return place.place_id == place_id; });
  				return {
  					'place_id': place_id,
  					'name': place.shortName,
  					'photoURL': place.photoURL,
  					'totalTrips': count
  				};
  			});
  			// console.log(placesOverview);

  		});
	  });

  }

  ngOnDestroy() {

    if(this.myTripsSub) {
  	  this.myTripsSub.unsubscribe();
    }

  	if(this.autorunSub) {
  		this.autorunSub.unsubscribe();
  	}

  	if(this.autorunPlacesSub) {
  		this.autorunPlacesSub.unsubscribe();
  	}

    if(this.autorunSubC) {
      this.autorunSubC.unsubscribe();
    }

    if(this.myNotifSub) {
      this.myNotifSub.unsubscribe();
    }

    if(this.isDriverSub){
      this.isDriverSub.unsubscribe();
    }
  }

  ionViewWillEnter() {

    this.viewCtrl.showBackButton(false);
  }

  getCurrentGeolocation() {
    this.originSearch = this.destinationSearch = '';
    this.loader = this.loadingCtrl.create({
      content: "Cargando...",
      spinner: "crescent"
    });
    this.loader.present();

    this.geoService.getCurrentGeolocation().then((position) => {
      this.currentPosition = position;
      // console.log(this.currentPosition);
      if(!this.isDriverPipe.transform(Meteor.user())) {
        this.getCurrentLocation();
      } else {
        this.loader.dismissAll();
      }

    }).catch((error) => {
      alert("Error obtaining geolocation");
      console.log(error);
      this.loader.dismissAll();
    });
  }

  getCurrentLocation() {
  	this.geoService.getCurrentLocation(this.currentPosition).then((position) => {
  		this.originSearch = position.city;
      this.loader.dismissAll();
  	}).catch((error) => {
  		alert("Error al obtener su ubicación actual");
      console.log(error);
      this.loader.dismissAll();
  	});
  }

  showSearchbar() {
  	this.searchBar = !this.searchBar;
  	this.boxHeightState = this.boxHeightState == 'collapsed' ? 'expand':'collapsed';
  }

  openTripListings(place: any) {
    // TODO: migrate component
  	// this.navCtrl.push(TripListMobileComponent, {place: place});
  }

  newTripModal() {
  	if(Meteor.user()) {
	  	let modal = this.modalCtrl.create(this.newTrip, {geolocation: this.currentPosition});
  		modal.present();
  	} else {
  		alert("Constraint error!");
  	}
  }

  editTripModal(trip: Trip) {
    // TODO: migrate component
  	// let modal = this.modalCtrl.create(this.tripDetail, {trip: trip});
	  // modal.present();
  }

  openTripMessageBoard(trip: Trip) {
    // TODO: migrate component
  	// let modal = this.modalCtrl.create(TripMessageBoardMobileComponent, {trip: trip});
	  // modal.present();
  }

  openNotificationsBoard() {
    // TODO: migrate component
    // let modal = this.modalCtrl.create(UserNotificationsMobileComponent, {});
    // modal.present();
  }


  clearOrigin(){
    this.originSearch = '';
    this.getPlacesOverview();
  }

  clearDestination(){
    this.destinationSearch = '';
    this.getPlacesOverview();
  }

  shareTrip(trip: Trip) {
    if(this.platform.is('cordova')) {
      this.loader = this.loadingCtrl.create({
        content: "Compartiendo viaje...",
        spinner: "crescent"
      });
      this.loader.present();
      var options = {
        message: 'share this', // not supported on some apps (Facebook, Instagram)
        subject: 'the subject', // fi. for email
        // files: ['/assets/default-avatar.png'],
        url: 'http://simpleride-ec.com',
        chooserTitle: 'Simple Ride' // Android only, you can override the default share sheet title
      }

      var onSuccess = function(result) {
        console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
        console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
      }

      var onError = function(msg) {
        console.log("Sharing failed with message: " + msg);
      }

      // window['plugins'].socialsharing.shareWithOptions(options, onSuccess, onError);

      // window['plugins'].socialsharing.shareViaFacebook('Message via Facebook', document.baseURI + 'sharing-image.png', document.baseURI + 'share/trip/' + trip._id,
      //   function() {console.log('share ok')}, function(errormsg){console.log(errormsg)})

      window['plugins'].socialsharing.shareViaFacebook('Message via Facebook', 'http://simpleride-ec.com/sharing-image.png',
        'http://simpleride-ec.com/' + 'share/trip/' + trip._id, // + '?_escaped_fragment_=',
        () => { // on success
          this.loader.dismiss();
        },
        (errormsg) => {
          this.loader.dismiss();
          if(errormsg != 'cancelled') {
            alert('Ha ocurrido un error al compartir. Inténtelo nuevamente');
          }
          console.log(errormsg);

        }
      );

    } else {

    }

  }


    validateGeolocation() {

      let isLocationEnabled = this.platform.is('ios') ?
        cordova.plugins.diagnostic.isLocationEnabled:cordova.plugins.diagnostic.isGpsLocationEnabled;

      isLocationEnabled((enabled) => {
          if(enabled) {
            this.loadGMapsScript('https://maps.google.com/maps/api/js?key=AIzaSyA4o5dp21Sdw7vyUO0iC5mua7f9gMx6_2w&libraries=places',
              () => {
                console.log('google api loaded');
                this.getCurrentGeolocation();
            });
          } else {
              let alert = this.alertCtrl.create({
              'title': 'Geolocalización desactivada',
          'subTitle': 'Por favor activa la geolocolazación para continuar',
          buttons: [
          {
            text: 'OK',
            handler: () => {
              let switchToSettings = this.platform.is('ios') ?
                cordova.plugins.diagnostic.switchToSettings:cordova.plugins.diagnostic.switchToLocationSettings;
              switchToSettings();
          }
          }]
            });
            alert.present();
          }
        },
        (error) => {
          console.log(error);
        });
    }

}
