import { Component, ViewChild } from '@angular/core';
import { Slides, NavController } from 'ionic-angular';

import { UserRegistrationMobileComponent } from '../registration/registration.component.mobile';

@Component({
  templateUrl: 'intro-slides.component.mobile.html'
})
export class IntroSlidesMobileComponent {

  @ViewChild(Slides) slides: Slides;

  sources = [
    "assets/intro/slide-1.jpg",
    "assets/intro/slide-2.jpg",
    "assets/intro/slide-3.jpg",
    "assets/intro/slide-4.jpg",
    "assets/intro/slide-5.jpg"
  ];

  constructor(private navCtrl: NavController){

  }

  slideChanged() {
    if(this.sources.length == this.slides.getActiveIndex()) {
      this.navCtrl.push(UserRegistrationMobileComponent);
    }
  }
}
