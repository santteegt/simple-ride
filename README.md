# simple-ride

Webapp for the Simple Ride platform based on Ionic 3 CLI and Meteor framework >1.4 as backend

## Prerequisites

* NPM [How-to](https://nodejs.org/en/)
* Meteor [How-to](https://www.meteor.com/install)
* Meteor Client Bundler -> Install it running the command `npm install -g meteor-client-bundler`
* Ionic [How-to](https://ionicframework.com/getting-started/)
* Android SDK with tools 25.1.6 and platform-tools 25.0.1

## Mobile app setup

```
npm install
npm run meteor-client:bundle # Configure meteor-client.config.json accordingly
```

### Android setup

* Generate keystore file
```
$HOME/platforms/android $ keytool -genkey -v -keystore simpleride.keystore -alias SimpleRide -keyalg RSA -keysize 2048 -validity 10000
```

### Run the mobile app locally

```
ionic serve # run on the desktop

```

### Deploy/Build app for production

In order to run the app on a mobile device  or build the app in production mode, you **MUST** temporarily remove the following packages in the Meteor backend. **REMEMBER** to discard those changes before deploying the backend

```
cd api
meteor remove  angular2-compilers barbatus:angular2-polyfills
meteor add ecmascript
cd ..
ionic cordova run [android|ios] # run on a connected device
ionic cordova run [android|ios] --prod --release # run on a connected device for production testing
```

## Backend Setup

* Configure Server IP address in the `api/package.json` script accordingly

* Execute the following command

```
npm run api
```

### Deploying the Server under a AWS EC2 instance using mup

* Configure `api/.deploy/mup.js` accordingly

* Run the following commands:

```
cd api/.deploy
mup setup
mup deploy
```

More info about conf: [click here](https://github.com/kadirahq/meteor-up)

* To inspect the server logs, you can execute the following command:

```
cd api/.deploy
mup logs -f
```
