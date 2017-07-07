import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { enableProdMode } from "@angular/core";
import { Meteor } from "meteor/meteor";

enableProdMode();

import { AppModule } from "./imports/app/app.module";


function setClass(css) {
  if (!document.body.className) {
    document.body.className = "";
  }
  document.body.className += " " + css;
}

Meteor.startup(() => {
  setClass('web');
  platformBrowserDynamic().bootstrapModule(AppModule);
});
