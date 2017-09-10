import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { BrowserModule } from "@angular/platform-browser";
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Keyboard } from '@ionic-native/keyboard';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation } from '@ionic-native/geolocation';
import { Camera } from '@ionic-native/camera';
import { Push } from '@ionic-native/push';
import { AppVersion } from '@ionic-native/app-version';
import { SocialSharing } from '@ionic-native/social-sharing';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { IonCalendarModule } from "@ionic2-extra/calendar";
import { ImgCacheModule, ImgCacheService } from 'ng-imgcache';

import { MyApp } from './app.component.mobile';
import { MOBILE_DECLARATIONS } from '../pages/index';
import { SHARED_DECLARATIONS } from '../classes/shared';
 
@NgModule({
  declarations: [
    MyApp,
    ...MOBILE_DECLARATIONS,
    ...SHARED_DECLARATIONS
  ],
  imports: [
    BrowserModule,
    IonCalendarModule,
    ImgCacheModule,
    IonicModule.forRoot(MyApp, {
      scrollAssist: false,
      autoFocusAssist: false
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ...MOBILE_DECLARATIONS
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    StatusBar,
    SplashScreen,
    Keyboard,
    BackgroundGeolocation,
    Geolocation,
    Camera,
    Push,
    AppVersion,
    SocialSharing,
    InAppBrowser,
    ImgCacheService
  ]
})
export class AppModule {}