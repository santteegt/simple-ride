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
import "./imports/publications/user-places.ts";
import "./imports/publications/campaings.ts";
import "./imports/publications/campaing-logs.ts";
import "./imports/push"; // ENABLE PUSH NOTIFICATIONS

declare var SyncedCron;
declare const ServiceConfiguration: any;

// For testing push notifications under development
declare var process;
process.env.NODE_ENV = "development";

Meteor.startup(() => {
  // code to run on server at startup

	// Configuring oAuth services
	const services = Meteor.settings.private.oAuth;

	if (services) {
		for (let service in services) {
			ServiceConfiguration.configurations.upsert({service: service}, {
				$set: services[service]
			});
		}
	}
	SyncedCron.start();
});
