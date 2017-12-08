import { Push } from 'meteor/raix:push';

import { Notifications } from '../../both/collections/notifications.collection';
import { Notification, NotificationBody } from '../../both/models/notification.model';

Push.debug = true;

Push.Configure({
  apn: {
    certData: Assets.getText('push_certs/SimpleRide-dev.pem'), // development
    keyData: Assets.getText('push_certs/SimpleRideKey-dev.pem'), // development
    // certData: Assets.getText('push_certs/SimpleRide-prod.pem'), // production
    // keyData: Assets.getText('push_certs/SimpleRideKey-prod.pem'), // production
    passphrase: 'simpleride',
    production: false,
    gateway: 'gateway.sandbox.push.apple.com' // development
    // gateway: 'gateway.push.apple.com' // production
  },
  gcm: {
    apiKey: 'AAAAFdnDuNc:APA91bEgzEvj-4MwU9xvEoyYSt1bmzzMD-naR-02ZPwlQvUWrpxCIHIKbDtsMU1WytYaLcagYI8qldvpAynpiL47hBYEnZMfPDQHsd0u-bK1QgaEGlBYj3EFzMQQgSImFL5RwwS2TQe3',
    projectNumber: 93847795927
  }
});

Push.allow({
  send: (userId, notification) => {
    // allow all users to send notifications
    return true;
  }
});
