import { Meteor } from 'meteor/meteor';

declare var process;

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
