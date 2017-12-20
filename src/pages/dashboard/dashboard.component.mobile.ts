import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/core';
import { Platform, NavController, NavParams, ViewController, ModalController, LoadingController,
  MenuController, AlertController } from 'ionic-angular';
import { Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";
import { StatusBar } from "@ionic-native/status-bar";
import { SocialSharing } from '@ionic-native/social-sharing';
// TODO:
// import { _ } from 'meteor/underscore';
declare var _;
declare var Meteor;

// TODO:
// import { Counts } from 'meteor/tmeasday:publish-counts';
declare var Counts;

import { Dashboard } from "../../classes/dashboard.class";
import { GeolocationService } from "../../classes/services/geolocation.service";
import { UIUtilsService } from "../../classes/services/ui-utils.service";
import { NewTripMobileComponent } from '../trip/new-trip.component.mobile';
import { TripListMobileComponent } from '../trip/trip-list.component.mobile';
import { TripMobileComponent } from '../trip/trip.component.mobile';
import { TripMessageBoardMobileComponent } from '../trip/trip-message-board.component.mobile';
import { UserNotificationsMobileComponent } from '../user/user-notifications.component.mobile';

import { Places, Trips } from '../../shared/collections';
import { Trip } from '../../shared/models';

import { IsDriverPipe } from '../../classes/shared/is-driver.pipe';

declare var cordova;

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.mobile.html',
  providers: [GeolocationService, UIUtilsService, IsDriverPipe],
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
	tripDetail: Component = TripMobileComponent;

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
    private statusBar: StatusBar, private socialSharing: SocialSharing, private uiUtils: UIUtilsService) {
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

    if(this.platform.is('cordova')) {
      this.statusBar.overlaysWebView(false);
      this.statusBar.styleLightContent()
      this.statusBar.backgroundColorByHexString('43338E');
      this.statusBar.show();
    }

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

    this.myNotifSub = MeteorObservable.subscribe('notifications', Meteor.userId()).subscribe(() => {
      this.autorunSubC = MeteorObservable.autorun().subscribe(() => {
        this.notificationsCount = Counts.get('notificationsCount');
      });
    });

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
            this.geoService.getCurrentLocation(this.currentPosition).then((position) => {
                this.originSearch = position.city;
                this.getPlacesOverview();
            }).catch((error) => {
                this.presentAlert('Error', 'Error al obtener su ubicación actual');
            });
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
  	  		// let time = date.getHours().toString() + ':' + date.getMinutes().toString();

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
					'name': place ? place.shortName : '',
					'photoURL': place ? place.photoURL : '',
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
    this.uiUtils.presentToast('Obteniendo ubicación...', 'toast-loading', undefined, undefined, 10000);
    this.originSearch = this.destinationSearch = '';
    // this.loader = this.loadingCtrl.create({
    //   content: "Cargando...",
    //   spinner: "crescent"
    // });
    // this.loader.present();

    this.geoService.getCurrentGeolocation().then((position) => {
      this.currentPosition = position;
      // console.log(this.currentPosition);
      if(!this.isDriverPipe.transform(Meteor.user())) {
        this.getCurrentLocation();
      } else {
        this.uiUtils.toastInstance.dismiss();
        // this.loader.dismissAll();
      }

    }).catch((error) => {
      this.presentAlert('Error', 'Error al obtener la geolocalización');
      this.uiUtils.toastInstance.dismiss();
      console.log(error);
      // this.loader.dismissAll();
    });
  }

  getCurrentLocation() {
  	this.geoService.getCurrentLocation(this.currentPosition).then((position) => {
	this.originSearch = position.city;
    this.getPlacesOverview();
    this.uiUtils.toastInstance.dismiss();
    // this.loader.dismissAll();
  	}).catch((error) => {
      this.presentAlert('Error', 'Error al obtener su ubicación actual');
      console.log(error);
      this.uiUtils.toastInstance.dismiss();
      // this.loader.dismissAll();
  	});
  }

  showSearchbar() {
  	this.searchBar = !this.searchBar;
  	this.boxHeightState = this.boxHeightState == 'collapsed' ? 'expand':'collapsed';
  }

  openTripListings(place: any) {
  	this.navCtrl.push(TripListMobileComponent, {place: place});
  }

  newTripModal() {
  	if(Meteor.user()) {
	  	let modal = this.modalCtrl.create(this.newTrip, {geolocation: this.currentPosition});
  		modal.present();
  	} else {
      this.presentAlert('Error', 'Error al crear el viaje. Por favor intenta de nuevo.');
  	}
  }

  editTripModal(trip: Trip) {
  	let modal = this.modalCtrl.create(this.tripDetail, {trip: trip});
	  modal.present();
  }

  openTripMessageBoard(trip: Trip) {
  	let modal = this.modalCtrl.create(TripMessageBoardMobileComponent, {trip: trip});
	  modal.present();
  }

  openNotificationsBoard() {
    let modal = this.modalCtrl.create(UserNotificationsMobileComponent, {});
    modal.present();
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

      let tripDay: String = this.getTripDay(trip.departureDate);
      let message = 'Estoy viajando a ' + trip.destination.shortName + ' el ' + tripDay + ' ' + trip.departureDate.toLocaleDateString();

      // this.socialSharing.canShareVia('com.apple.social.facebook').then(() => {


        // this.socialSharing.shareViaFacebookWithPasteMessageHint('Message via Facebook', 'https://simpleride-ec.com/sharing-image.png',
        //   'https://simpleride-ec.com/' + 'share/trip/' + trip._id, message)
        this.socialSharing.shareViaFacebook('Message via Facebook', 'https://simpleride-ec.com/sharing-image.png',
          'https://simpleride-ec.com/' + 'share/trip/' + trip._id)
        .then(() => {
            this.loader.dismiss();
        })
        .catch((errormsg) => {
            this.loader.dismiss();
            if(errormsg != 'cancelled' && errormsg != 'not available') {
              console.log(errormsg);
              // alert(errormsg);
              this.presentAlert('Error', 'Ha ocurrido un error al compartir. Inténtelo nuevamente');
            }
        });

      // }).catch((error) => {
      //   this.presentAlert('Error', 'Compartir no habilitado en tu plataforma');
      // });


    } else {

      this.presentAlert('Error', 'Compartir no habilitado en tu plataforma');

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

  getTripDay(date: Date) {
    let day: string;
    const today = new Date();
    if(today.getDate() == date.getDate() && today.getMonth() == date.getMonth() && today.getFullYear() == date.getFullYear()) {
      day = " Hoy";
    } else {
      day = " el ";
      switch(date.getDay()) {
        case 0:
          day += "Domingo";
          break;
        case 1:
          day += "Lunes";
          break;
        case 2:
          day += "Martes";
          break;
        case 3:
          day += "Miércoles";
          break;
        case 4:
          day += "Jueves";
          break;
        case 5:
          day += "Viernes";
          break;
        case 6:
          day += "Sabado";
          break;
        default:
          break;
      }
    }
    return day;
  }

  presentAlert(title: string, message: string) {
		let alert = this.alertCtrl.create({
	      'title': title,
	      'subTitle': message,
	      buttons: [
        {
          text: 'OK'
        }]
	    });
	    alert.present();
	}

}
