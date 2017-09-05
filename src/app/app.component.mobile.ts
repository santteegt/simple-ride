// TODO:
// import { Meteor } from "meteor-client";
declare var Meteor;
import { Component } from '@angular/core';
import { MenuController, Platform, App, ModalController, Config, AlertController, ViewController } from 'ionic-angular';
import { Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";
// import { ObservableCursor } from "meteor-rxjs";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';
import { Push } from '@ionic-native/push';

import { LoginMobileComponent } from '../pages/login/login.component.mobile';

import { DashboardMobileComponent } from "../pages/dashboard/dashboard.component.mobile";
import { IntroSlidesMobileComponent } from "../pages/intro/intro-slides.component.mobile";
import { UserRegistrationMobileComponent } from "../pages/registration/registration.component.mobile";
import { CarRegistrationMobileComponent } from "../pages/registration/car-registration.component.mobile";
import { DriverProfileMobileComponent } from "../pages/driver/driver-profile.component.mobile";
import { MyTripsMobileComponent } from "../pages/user/my-trips.component.mobile";
import { TripHistoryMobileComponent } from '../pages/user/trip-history.component.mobile';
import { OnTripMobileComponent } from '../pages/user/ontrip.component.mobile';
import { UserNotificationsMobileComponent } from '../pages/user/user-notifications.component.mobile';
import { UserDocumentsMobileComponent } from '../pages/user/user-documents.component.mobile';
import { AboutMobileComponent } from '../pages/terms/about.component.mobile';
import { OfflinePageMobileComponent } from '../pages/terms/offline-page.component.mobile';
import { PaymentInfoMobileComponent } from '../pages/user/payment-info.component.mobile';

import { UserTripFlags, Users } from "../shared/collections";
import { UserTripFlag, Person, USER_STATUS, DRIVER_STATUS } from "../shared/models";
// import { UserTripFlags, Users } from "api/collections";
// import { UserTripFlag, Person, USER_STATUS, DRIVER_STATUS } from "api/models";

// TODO:
// import { Counts } from 'meteor/tmeasday:publish-counts';
declare var Counts;

@Component({
  templateUrl: 'app.component.mobile.html'
})
export class MyApp {

  rootPage: any;

  person: Person;
  userImg: string;
  profile: Component;
  driverProfile: Component;
  myTrips: Component;
  tripsHistory: Component;
  notificationList: Component;
  userDocuments: Component;
  about: Component;
  paymentInfo: Component;

  autorunSub: Subscription;

  tripFlagSub: Subscription;
  // TODO:
  // tripFlags: ObservableCursor<UserTripFlag>;
  tripFlags: any;

  isDriver: boolean;

  autorunSubC: Subscription;
  myNotifSub: Subscription;
  notificationsCount: number;

  verified: boolean;
  verifing: boolean;
  imgLoaded: boolean;

  autorunConnected: Subscription;

  user: any;

  constructor(private app: App, private platform: Platform, private statusBar: StatusBar, private splashScreen: SplashScreen,
      private menu: MenuController, private modalCtrl: ModalController, private config: Config, private keyboard: Keyboard,
      private push: Push, private alertCtrl: AlertController) {

    this.profile = UserRegistrationMobileComponent;
    this.driverProfile = DriverProfileMobileComponent;
    this.myTrips = MyTripsMobileComponent;
    this.tripsHistory = TripHistoryMobileComponent;
    this.notificationList = UserNotificationsMobileComponent;
    this.userDocuments = UserDocumentsMobileComponent;
    this.paymentInfo = PaymentInfoMobileComponent;
    this.about = AboutMobileComponent;

    this.menu.enable(true);

    this.imgLoaded = false;
    const me = this;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if(platform.is('cordova')) {
        // Handle back button on Android
        let unregister = platform.registerBackButtonAction(() => {
          let nav = app.getActiveNav();
          let activeView: ViewController = nav.getActive();

          if(activeView != null){
            if(nav.canGoBack()) {
              nav.pop();
            }else if (typeof activeView.instance.backButtonAction === 'function') {
              activeView.instance.backButtonAction();
            }else {
              unregister();
            }
          }else{
            unregister();
          }
        });

        this.statusBar.styleDefault();
        this.statusBar.hide();
        if(platform.is('android')) {
          this.splashScreen.hide();
        }

        this.keyboard.disableScroll(true);
        this.keyboard.hideKeyboardAccessoryBar(false);

      }

      // TODO: Why the disabled the menu here ?
      // this.menu.enable(false);

      // TODO: Meteor function in ionic client

      // Tracker.autorun(() => { // TODO: Manage redirection links shared on social media
      //   let redirect = Session.get('redirect');
      //   if (redirect) {
      //     console.log('vamos a redireccionar esta wea men!');
      //     // this.app.getActiveNav().push()
      //     Session.set('redirect', false);
      //   }
      // });

      this.autorunConnected = MeteorObservable.autorun().subscribe(() => {

        this.app._setDisableScroll(false);

        let connected = Meteor.status().connected;
        console.log('connection alive: ' + connected);
        if(connected && connected != window['meteor_connection']) {

          if(this.autorunSub) {
            this.autorunSub.unsubscribe();
          }

          if(this.tripFlagSub) {
            this.tripFlagSub.unsubscribe();
          }

          this.autorunSub = MeteorObservable.autorun().subscribe(() => {
            if(!Meteor.userId()) {
              me.rootPage = LoginMobileComponent;
            } else if(Meteor.user()) {
              this.user = Meteor.user();
              this.verified = this.user['personData'].isDriver ? this.user['driverData'].status == DRIVER_STATUS.VERIFIED : this.user['personData'].status==USER_STATUS.VERIFIED;
              this.verifing = this.user['personData'].isDriver ? (this.user['driverData'].status == DRIVER_STATUS.UPLOADED_ONE || this.user['driverData'].status == DRIVER_STATUS.UPLOADED_TWO || this.user['driverData'].status == DRIVER_STATUS.VERIFIED_ONE) : this.user['personData'].status == USER_STATUS.UPLOADED_DNI;
              if(this.user['personData'].status == USER_STATUS.NEW) {
                me.rootPage = IntroSlidesMobileComponent;
              } else if(this.user['driverData'].status == DRIVER_STATUS.NEW) {
                me.rootPage = CarRegistrationMobileComponent;
              } else {
                this.isDriver = this.user['personData'].isDriver;

                if(this.tripFlagSub) {
                  this.tripFlagSub.unsubscribe();
                }

                this.tripFlagSub = MeteorObservable.subscribe('trip-flags').subscribe(() => {
                  this.tripFlags = UserTripFlags.find({'user_id': Meteor.userId()});

                  if(this.tripFlags.fetch().length == 0) {
                    console.log('no active trips');
                    this.rootPage = DashboardMobileComponent;
                  } else {
                    this.rootPage = OnTripMobileComponent;
                  }
                  this.tripFlags.subscribe((data: UserTripFlag[]) => {
                    if(data.length > 0) {
                      console.log('user is on a trip');
                      console.log(data);
                      if(this.rootPage != OnTripMobileComponent) {
                        me.rootPage = OnTripMobileComponent;
                      }
                    } else {
                      me.rootPage = DashboardMobileComponent;
                    }
                  });

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
            }
          });

        } else if(!connected && connected != window['meteor_connection']) {
          if(!Meteor.user()) {
            this.app._setDisableScroll(true);
            me.rootPage = OfflinePageMobileComponent;

          }
        }

        if(Meteor.status().retryCount == 5 && Meteor.status().status == "waiting") {
          alert("Error al conectarse al servicio. Compruebe que su dispositivo tenga conexión a internet");
        }

        window['meteor_connection'] = connected;

      });

    });
  }

  openPage(page: Component, params: any) {

    this.menu.close();
    let modal = this.modalCtrl.create(page, params);
    modal.present();
  }

  setActiveProfile() {

    if(this.isDriver && !Meteor.user()['driverData'].status) {
      let modal = this.modalCtrl.create(CarRegistrationMobileComponent, {isModal: true});
      modal.present();
      modal.onDidDismiss((data) => {
        if(data.valid_driver) {
          let modifier = {'personData.isDriver': true};
          Users.update({'_id': Meteor.userId()}, {$set: modifier});
        } else {
          this.isDriver = false;
        }
      });
    } else {
      let modifier = {'personData.isDriver': this.isDriver};
      Users.update({'_id': Meteor.userId()}, {$set: modifier});
    }

  }

  logout() {
    this.menu.close();
    Meteor.logout();
    this.app.getRootNav().setRoot(LoginMobileComponent, {});
  }

  openNotificationList() {
    console.log('open notitications');
  }

  ngOnDestroy() {
    this.tripFlagSub.unsubscribe();
    this.autorunSubC.unsubscribe();
    this.myNotifSub.unsubscribe();
    this.autorunSub.unsubscribe();
    this.autorunConnected.unsubscribe();
  }
}
