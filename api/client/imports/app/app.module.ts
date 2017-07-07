import { NgModule, isDevMode } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule }   from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { MetaModule } from 'ng2-meta';
import { JsonpModule } from '@angular/http';

import { AppComponent } from "./app.component.web";
import { WEB_DECLARATIONS } from './web';

// import { SHARED_DECLARATIONS } from './shared';
import { routes, ROUTES_PROVIDERS } from './app.routes';

import { CarouselModule, ModalModule } from 'ngx-bootstrap';

let moduleDefinition = {
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    MetaModule.forRoot(),
    CarouselModule.forRoot(),
    ModalModule.forRoot(),
    JsonpModule
  ],
  // Components, Pipes, Directive
  declarations: [
    AppComponent,
    ...WEB_DECLARATIONS//,
    // ...SHARED_DECLARATIONS
  ],
  providers: [
    ...ROUTES_PROVIDERS
  ],
  bootstrap: [
    AppComponent
  ]
}


@NgModule(moduleDefinition)
export class AppModule {
  constructor() {

  }
}
