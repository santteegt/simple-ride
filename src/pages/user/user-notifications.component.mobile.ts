import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, LoadingController } from 'ionic-angular';
import { Observable, Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";
// TODO:
// import { _ } from 'underscore';
declare var _;

import { TripMobileComponent } from '../trip/trip.component.mobile';
import { TripMessageBoardMobileComponent } from '../trip/trip-message-board.component.mobile';
import { MyTripsMobileComponent } from './my-trips.component.mobile';
import { UploadDepositVoucherMobileComponent } from '../checkout/upload-deposit-voucher.component.mobile';
import { TripReviewMobileComponent } from '../trip/trip-review.component.mobile';

import { Utils } from '../../classes/shared/utils';
import { TripUtils } from '../../classes/trip-utils.class';

import { Notification } from '../../shared/models';
import { Notifications } from '../../shared/collections';


@Component({
  selector: 'user-notifications',
  templateUrl: 'user-notifications.component.mobile.html'
})
export class UserNotificationsMobileComponent implements OnInit, OnDestroy {

  myNotifSub: Subscription;
  myNotifOb: Observable<Notification[]>;

  hasNotifications: boolean;

  utils: Utils;
  tripUtils: TripUtils;
  loader;

  constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
  	private modalCtrl: ModalController, private loadingCtrl: LoadingController) {

    this.hasNotifications = false;
    this.utils = new Utils();
    this.tripUtils = TripUtils;
  }

  ngOnInit() {

    this.loader = this.loadingCtrl.create({
      content: "Cargando...",
      spinner: "crescent"
    });

    this.loader.present();

    if(this.myNotifSub) {
      this.myNotifSub.unsubscribe();
    }
    this.myNotifSub = MeteorObservable.subscribe('notifications', Meteor.userId()).subscribe(() => {
      this.myNotifOb = Notifications.find({},{sort: {sent_date: -1}});

      this.myNotifOb.subscribe((data: Notification[]) => {
        this.hasNotifications = data.length > 0;
      });
      this.loader.dismiss();

    });


  }

  ngOnDestroy() {
    this.myNotifSub.unsubscribe();

  }

  openNotification(notification: Notification) {

    console.log(notification);

    let redirectComponent: Component;

    switch (notification.redirect_component) {
      case "TripMobileComponent":
        redirectComponent = TripMobileComponent;
        break;
      case "TripMessageBoardMobileComponent":
        redirectComponent = TripMessageBoardMobileComponent;
        break;
      case "MyTripsMobileComponent":
        redirectComponent = MyTripsMobileComponent;
        break;
      case "UploadDepositVoucherMobileComponent":
        redirectComponent = UploadDepositVoucherMobileComponent;
        break;
      case "TripReviewMobileComponent":
        redirectComponent = TripReviewMobileComponent;
        break;
      default:
        // code...
        break;
    }

    if(redirectComponent) {
      Notifications.update({_id: notification._id}, {$set: {read: true}});
      this.viewCtrl.dismiss();
      let modal = this.modalCtrl.create(redirectComponent, notification.redirect_params);
      modal.present();
    }

  }

  archiveNotifications() {

  }

  archiveNotification(notification: Notification) {
    Notifications.update({_id: notification._id}, {$set: {read:true, archived: true}});
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
