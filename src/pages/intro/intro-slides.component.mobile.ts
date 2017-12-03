import { Component, ViewChild } from '@angular/core';
import { Slides, NavController, NavParams, ViewController } from 'ionic-angular';

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

  calledFromMenu: boolean;

  constructor(private navCtrl: NavController, private navParams: NavParams, private viewCtrl: ViewController) {

    this.calledFromMenu = this.navParams.get('manual');

  }

  slideChanged() {
    if(this.sources.length == this.slides.getActiveIndex()) {
      
      this.viewCtrl.dismiss();

    }
  }
}
