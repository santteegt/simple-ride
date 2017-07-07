import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController,
          LoadingController, AlertController } from 'ionic-angular';
import { Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";
// TODO:
// import { InjectUser } from "angular2-meteor-accounts-ui";
// import { _ } from 'underscore';
declare var Meteor;
declare var _;

import { Reservation, Trip, Place, UserTripFlag, User } from '../../shared/models';
import { Reservations, Trips, Places, UserTripFlags, Users } from '../../shared/collections';

import { DetailedReservationMobileComponent } from '../trip/detailed-reservation.component.mobile';
import { TripMobileComponent } from '../trip/trip.component.mobile';
import { TripMessageBoardMobileComponent } from '../trip/trip-message-board.component.mobile';
import { UserProfileMobileComponent } from './user-profile.component.mobile';

import { GeolocationService } from "../../classes/services/geolocation.service";

import { IsDriverPipe } from '../../classes/shared/is-driver.pipe';

interface UserCode {
  user_id: string;
  verified: boolean
}

interface ServerResponse {
  status: number;
  message: string;
}

@Component({
  selector: 'ontrip',
  templateUrl: 'ontrip.component.mobile.html',
  providers: [GeolocationService, IsDriverPipe],
})
// @InjectUser('user')
export class OnTripMobileComponent implements OnInit, OnDestroy {

  tripFlagSub: Subscription;
  userTripFlag: UserTripFlag;

  tripSub: Subscription;
  mytrip: Trip;

  placesSub: Subscription;
  destination: Place;

  rsvpSub: Subscription;
  myrsvp: Reservation
  rsvpList: Reservation[];

  usersSub: Subscription;
  driver: User;
  userList: User[];
  userCodes: UserTripFlag[];
  verifiedCodes: UserCode[];

	loader;

  reservationDetailModal: Component;

  loadingImgs: any;

  user: any;

  constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
  	private modalCtrl: ModalController, private loadingCtrl: LoadingController, private alertCtrl: AlertController,
  	private geoService: GeolocationService, private isDriverPipe: IsDriverPipe) {

    // this.viewCtrl.showBackButton(false);
    // this.selectedItem = navParams.get('item');
    this.reservationDetailModal = DetailedReservationMobileComponent;
    this.verifiedCodes = [];
    this.loadingImgs = {};
  }

  ngOnInit() {

    MeteorObservable.autorun().subscribe(() => {
      this.user = Meteor.user();
    });

    this.loader = this.loadingCtrl.create({
      content: "Cargando...",
      spinner: "crescent"
    });

    this.loader.present();

    if (this.usersSub) {
      this.usersSub.unsubscribe();
    }

    if (this.rsvpSub) {
      this.rsvpSub.unsubscribe();
    }

    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }

    if (this.tripSub) {
      this.tripSub.unsubscribe();
    }

    if (this.tripFlagSub) {
  		this.tripFlagSub.unsubscribe();
  	}

    this.tripFlagSub = MeteorObservable.subscribe('trip-flags').subscribe(() => {
      this.userTripFlag = UserTripFlags.findOne({'user_id': Meteor.userId()});

      if(Meteor.isCordova) {
	      this.geoService.configureBackgroundLocation(this.userTripFlag);
		  this.geoService.startBackgroundGeolocation();
	  }

      this.tripSub = MeteorObservable.subscribe('trips', {}, false).subscribe(() => {
        this.mytrip = Trips.findOne({'_id': this.userTripFlag.trip_id});
        this.placesSub = MeteorObservable.subscribe('places').subscribe(() => {

          this.destination = Places.findOne({'place_id': this.mytrip.destination.place_id});
          if(this.userTripFlag.isDriver) {
            this.userCodes = UserTripFlags.find({'trip_id': this.userTripFlag.trip_id, 'isDriver': false}).fetch();

             this.rsvpSub = MeteorObservable.subscribe('reservations', {}, false, this.userTripFlag.user_id).subscribe(() => {

              this.rsvpList = Reservations.find({'trip_id': this.userTripFlag.trip_id}).fetch();

              let user_ids = _.map(this.rsvpList, function(rsvp: Reservation) {
                return rsvp.user_id;
              });

              this.usersSub = MeteorObservable.subscribe('user-public-data', user_ids).subscribe(() => {
                this.userList = Users.find({'_id': {$in: user_ids}}).fetch();
                this.loader.dismiss();

              });
            });


          } else {

            this.rsvpSub = MeteorObservable.subscribe('reservations', {}, true).subscribe(() => {

              this.myrsvp = Reservations.findOne({'trip_id': this.userTripFlag.trip_id});
              this.usersSub = MeteorObservable.subscribe('user-public-data', [this.myrsvp.driver_id]).subscribe(() => {
                this.driver = Users.findOne({'_id': this.myrsvp.driver_id});
                this.loader.dismiss();

              });
            });

          }
        });

      });

    });
  }

  ngOnDestroy() {

  	if(Meteor.isCordova) {
  		this.geoService.stopBackgroundGeolocation();
  	}

    this.usersSub.unsubscribe();
    this.rsvpSub.unsubscribe();
    this.placesSub.unsubscribe();
    this.tripSub.unsubscribe();
    this.tripFlagSub.unsubscribe();

  }

  getUserRSVP(user_id: string) {
    return _.find(this.rsvpList, function(rsvp: Reservation) {
      return rsvp.user_id == user_id;
    });
  }

  openTripDetails() {
    if(this.userTripFlag.isDriver) {
      let modal = this.modalCtrl.create(TripMobileComponent, {trip: this.mytrip, readOnly: true});
      modal.present();
    } else {
      this.navCtrl.push(DetailedReservationMobileComponent, {
        'trip': this.mytrip,
        'driver': this.driver,
        'rsvp': this.myrsvp,
        'isPushNav': true
      });
    }
  }

  openUserProfile(is_driver: boolean, user: User) {
    // let user: User;
    // if(is_driver) {
    //   user = this.driver;
    // } else {

    // }
    let modal = this.modalCtrl.create(UserProfileMobileComponent, {user_id: user._id, userData: user, isDriver: is_driver});
    modal.present();

  }

  opemMessageBoard() {
    this.navCtrl.push(TripMessageBoardMobileComponent, {'trip': this.mytrip, 'isPushNav': true});
  }

  verifiedCode(user_id: string) {
    return _.find(this.verifiedCodes, function(userCode: UserCode) {
      return userCode.user_id == user_id && userCode.verified;
    });
  }

  checkedCode(user_id: string, code: string) {
    return _.find(this.userCodes, function(userCode: UserTripFlag) {
      return userCode.user_id == user_id && userCode.code == code;
    });
  }

  enterUserCode(user: User) {
    let prompt = this.alertCtrl.create({
      title: 'Código de Usuario',
      message: "Ingresa el código del usuario que será entregado al finalizar el viaje",
      inputs: [
        {
          name: 'code',
          placeholder: 'Código de verificación'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {

          }
        },
        {
          text: 'Guardar',
          handler: data => {

            if(this.checkedCode(user._id, data.code)) {
              this.verifiedCodes.push({'user_id': user._id, 'verified': true});
            } else {
              this.showAlertMessage('Código Inválido', 'El código ingresado no es correcto');
            }


          }
        }
      ]
    });
    prompt.present();
  }

  showAlertMessage(title: string, subtitle: string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: [
      {
        text: 'OK',
        handler: () => {

        }
      }]
    });
    alert.present();
  }

  finishTrip() {
    // console.log(this.verifiedCodes);
    // console.log(this.userCodes);
    if(this.verifiedCodes.length == this.userCodes.length) {

    	this.loader = this.loadingCtrl.create({
	      content: "Procesando...",
	      spinner: "crescent"
	    });

	    this.loader.present();

		MeteorObservable.call('finishTrip', this.userTripFlag.trip_id).subscribe((response: ServerResponse) => {
			this.loader.dismiss();
			if(response.status == 200) {
			  this.showAlertMessage('Viaje Completado', 'Gracias por llegar a tu destino!');
			} else {

			}
		});

    } else {
      this.showAlertMessage('Validar Usuarios', 'Es necesario ingresar los códigos de verificación de todos los pasajeros');
    }

  }

  isDriver(): boolean {
    return this.userTripFlag!=null && this.userTripFlag.isDriver;
  }

  loadedImg(id: string) {
    this.loadingImgs[id] = true;
  }
}
