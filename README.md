# simple-ride

Webapp for the Simple Ride platform based on Ionic 3 CLI and Meteor framework >1.4 as backend

## Prerequisites

* NPM [How-to](https://nodejs.org/en/)
* Meteor [How-to](https://www.meteor.com/install)
* Ionic [How-to](https://ionicframework.com/getting-started/)
* Android SDK with tools 25.1.6 and platform-tools 25.0.1

## Application setup

```
npm install
npm run meteor-client:bundle # Configure meteor-client.config.json accordingly
```

### Android setup

* Generate keystore file
```
$HOME/platforms/android $ keytool -genkey -v -keystore simpleride.keystore -alias SimpleRide -keyalg RSA -keysize 2048 -validity 10000
```

## Run the mobile app

```
ionic serve # run on the desktop
ionic cordova run [android|ios] # run on a connected device
ionic cordova run [android|ios] --prod --release # run on a connected device for production testing
```

## Run the backend

Configure underlying script accordingly on `package.json`

```
npm run api
```
