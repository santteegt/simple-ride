import 'meteor-client';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// TODO:
// import { Meteor } from 'meteor-client';
declare var Meteor;
import { AppModule } from './app.module';


Meteor.startup(() => {
	platformBrowserDynamic().bootstrapModule(AppModule);
});
