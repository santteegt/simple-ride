import { Meteor } from 'meteor/meteor';

import "./imports/publications/users";
import "./imports/publications/user-records.ts";
import "./imports/publications/car-records.ts";
import "./imports/publications/reservations";
import "./imports/publications/trips";
import "./imports/publications/places";
import "./imports/publications/images";
import "./imports/publications/chat-messages";
import "./imports/publications/trip-flags";
import "./imports/publications/notifications";
// TODO: Migrate push services

declare const ServiceConfiguration: any;

Meteor.startup(() => {
  // code to run on server at startup

	// Configuring oAuth services
	const services = Meteor.settings.private.oAuth;
	console.log(services);

	if (services) {
		for (let service in services) {
			ServiceConfiguration.configurations.upsert({service: service}, {
				$set: services[service]
			});
		}
	}
});
