import 'meteor-client';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Meteor } from 'meteor/meteor';
import { AppModule } from './app.module';


Meteor.startup(() => {
	platformBrowserDynamic().bootstrapModule(AppModule);
});
