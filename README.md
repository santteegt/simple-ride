# SimpleRide

Webapp for the Simple Ride platform based on Ionic 3.x.x and Meteor framework >1.4 as backend

## 1. Prerequisites

* NPM ([How-to](https://nodejs.org/en/))
* Meteor 1.6.0.x ([How-to](https://www.meteor.com/install)) -> curl "https://install.meteor.com/?release=1.6.0.1" | sh
* Meteor Client Bundler 0.2.1 -> Install it running the command `npm install -g meteor-client-bundler`
* Ionic 3.8.0 ([How-to](https://ionicframework.com/getting-started/))
* Android SDK with tools 25.1.6 and platform-tools 25.0.1
* Gradle 4.5.1

In case you are some releases ahead Meteor required version, downgrade using the following steps:

```
$ sudo rm /usr/local/bin/meteor
$ rm -rf ~/.meteor
$ sudo chown -R $(whoami) ~/.npm
$ curl "https://install.meteor.com/?release=1.6.0.1" | sh
```

## 2. Deploy/Build app for production

**REMEMBER** to configure environment variabled under `api` script definition in the `packages.json` file.
**REMEMBER** to copy your iOS push certificates into api/private/push_certs

* To run the API, execute the following commands:

```
$ cd api && meteor npm install
$ npm run api # Configure api script parameters accordingly in the packages.json file
```

### 2.1 Mobile app setup

* Run the following command in the project root:

```
npm install
```

* In order to run the app on a mobile device or build the app in production mode, you **MUST** temporarily remove the following packages in the Meteor backend. **REMEMBER** to discard those changes before deploying the backend in case you're working with both modules under the same project folder

```
$ cd api
$ meteor [--release 1.6.0.1] remove angular2-compilers barbatus:angular2-polyfills
$ meteor [--release 1.6.0.1] add ecmascript
$ cd ..
$ npm run meteor-client:bundle # Configure meteor-client.config.json accordingly
$ ionic cordova run [android|ios] # run on a connected device
$ ionic cordova run [android|ios] --prod --release # run on a connected device for production testing
```
#### 2.1.1 Common issues when trying to run the app

##### 2.1.1.1 meteor-client-bundler is automatically updating meteor version?

* If this is happening, you must tweak the meteor-client-bundler cli script under the `~/.nvm` folder. **TODO**: update to latest version of the script, which allows to send the version as parameter 

##### 2.1.1.2 uint8 problem in meteor-client

* **REMEMBER** `uint8` and `uint32` are giving problems on some browsers and iOS devices with OS < 10. To avoid this, comment these lines on `node_modules/meteor-client.js`

```
_require('core-js/modules/es6.typed.uint8-array'); // 56
_require('core-js/modules/es6.typed.uint32-array'); // 57
```
#### 2.1.1.3 cordova-plugin-file-transfer problem

* When running the application on a device for the first time, you may get an error regarding **cordova-plugin-file-transfer**. To solve this issue, run the following:

```
ionic cordova plugin add cordova-plugin-file-transfer@1.6.3 --force
```

#### 2.1.2 Android setup

* Generate keystore file
```
$HOME/platforms/android $ keytool -genkey -v -keystore simpleride.keystore -alias SimpleRide -keyalg RSA -keysize 2048 -validity 10000
```

* When running the app on an android device, Gradle might give you problems, so add the following to the end of `platforms/android/build.gradle` file:

```
configurations.all {
    resolutionStrategy.eachDependency { DependencyResolveDetails details ->
        def requested = details.requested
        if (requested.group == 'com.android.support') {
            if (!requested.name.startsWith("multidex")) {
                details.useVersion '25.3.1'
            }
        }
    }
}
```

* In order to fix the issue with multipleAPK compilation, move the following file to `platforms/android`:

```
mv build-extras.gradle.example platforms/android/build-extras.gradle
```

* Finally, configure the following variable in the same build file:

```
android {
  ...
  ...
  flavordimensions "default"
  ...
  ...
```

#### 2.1.3 iOS setup

* After building the app, open the project on XCode. Do not forget to check the following parameters on the info.plist properties file:

NSLocationWhenInUseUsageDescription: string description

NSCameraUsageDescription: string description

NSPhotoLibraryUsageDescription: string description of the need of accessing the user photo library

NSMotionUsageDescription: string description of the need of accesing the user geolocation while he is in motion

* When building the app, a missing `SimpleRide.pod` file should appear as an error. You must delete it under `Build Phases/Embed Pods Frameworks`

### 2.2 Push Notifications Setup

1. Enable the following code under the `server/main.js` file

```
import "./imports/push.js"; // ENABLE PUSH NOTIFICATIONS
```

#### 2.2.1 iOS

2. If you already have valid certificates, jump through to step 8
3. Generate Push Notification Certificates for development and production through the Apple Developer site. (aps_development.cer & aps.cer)
4. Import them into the KeyChain Access
5. Export them into .p12 certificates (name them as CertificateDev.p12 & CertificateProd.p12 respectively)
6. Run the following commands:

```
$ openssl x509 -in aps_development.cer -inform DER -outform PEM -out SimpleRide-dev.pem
$ openssl pkcs12 -in CertificateDev.p12 -out SimpleRideKey-dev.pem -nodes
$ openssl x509 -in aps.cer -inform DER -outform PEM -out SimpleRide-prod.pem
$ openssl pkcs12 -in CertificateProd.p12 -out SimpleRideKey-prod.pem -nodes
```

7. Optionally, you can test the certificates by running the following:

```
# Development
$ openssl s_client -connect gateway.sandbox.push.apple.com:2195 -cert meteorApp-cert-dev.pem -key meteorApp-key-dev.pem
# Production
$ openssl s_client -connect gateway.push.apple.com:2195 -cert meteorApp-cert-prod.pem -key meteorApp-key-prod.pem
```

8. Paste the generated files on the `private/push_certs` folder
9. If you are testing push notifications under development, enable the following lines on the `server/main.js` file:

```
// For testing push notifications under development
declare var process;
process.env.NODE_ENV = "development";
```

10. Configure the `server/imports/push.js` file accordingly

11. Remember to enable Push Notifications on XCode before Archiving the app to be uploaded to the App Store, or for local development

#### 2.2.2 Android

2. You need to obtain a Server API Key and a SENDERID from the Firebase Cloud Messaging console

3. Update the SENDERID value on the `src/app/pages/login/login.component.mobile.ts` component

4. Update the FCM API key on the file `server/imports/push.js`

5. If you are testing push notifications under development, enable the following lines on the `server/main.js` file:

```
// For testing push notifications under development
declare var process;
process.env.NODE_ENV = "development";
```

6. In production, remember to link your FCM APi Key with the app in Google Play. Take a look at this [README](https://github.com/raix/push/blob/master/docs/ANDROID.md#linking-the-fcm-service-to-your-android-app) for instructions

### 2.3 Deploying the Server under a AWS EC2 instance using mup

#### 2.3.1 Backend Setup

* Configure Server IP address in the `api/package.json` script accordingly

#### 2.3.2 Configuring mup

* Configure `api/.deploy/mup.js` accordingly. **REMEMBER** to set the `path` property to the location of the local api sourcecode

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

### 2.4 MongoDB Backup

* To **manually** backup the mongodb schema see this [instructions](https://github.com/xpressabhi/mup-data-backup)

## 3. Local Deployment

### 3.1 Run the mobile app locally

To run the app locally, you need an NGINX instance with the following configuration:

```
server {
    listen      80;
    server_name <API-SERVER-IP-ADDRESS>;

    location / {
      proxy_pass http://<MOBILEAPP-CLIENT-IP-ADDRESS>:8100;
    }
    location ~ ^/(_oauth|packages|ufs) {
      proxy_pass http://<API-SERVER-IP-ADDRESS>:3000;
    }
    location /sockjs {
      proxy_pass http://<API-SERVER-IP-ADDRESS>:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }

    error_page  500 502 503 504 /50x.html;
    location = /50x.html {
    root /usr/share/nginx/html;
    }
}
```

For a complete config file example, take a look to the [nginx.conf.example](nginx.conf.example) file.

To restart nginx service you can use the following commands:

```
$ kill -QUIT $( cat /run/nginx.pid )
$ /usr/sbin/nginx -t -c /etc/nginx/nginx.conf # IF YOU WANT TO TEST THE CONFIG FILE FIRST
$ /usr/sbin/nginx -c /etc/nginx/nginx.conf # START THE SERVICE. In UBUNTU, you can use systemctl [stop|start] nginx.service
```

Finally, to start serving the mobile app in your local machine, run the following command:

```
ionic serve # run on the desktop

```

### 3.2 Develop/Test admin pages locally

* In order to develop/test admin features make sure to specity port 3000 in the ROOT_URL environment variable on the `api` script defined in the packages.json file. For example: `ROOT_URL=http://<local_IP_address>:<3000>`. This is very important to configure if you don't have to experiment any issues with facebook login

* Make sure to shutdown any NGINX server configured to make the mobile app work locally.

## 4. Deploy/Build development environment using Heroku

A development environment is available in this [instance](https://simpleride.herokuapp.com) on Heroku

If deploying to Heroku for the first time, follow the instructions in this [link](https://medium.com/@leonardykris/how-to-run-a-meteor-js-application-on-heroku-in-10-steps-7aceb12de234). On the other hand, if you want to deploy the app into an existing Heroku instance, run `heroku git:clone -a simpleride` and add the origin remote to sync the repo.

In case your Heroku instance is not already configured, remember to configure the following environment variables in order to successfully deploy the app

```
heroku config:add APN_CERT="$(cat $PATH_TO_SimpleRide-dev.pem)"
heroku config:add APN_CERT="$(cat $PATH_TO_SimpleRideKey-dev.pem)"
heroku config:add BUILDPACK_PRELAUNCH_METEOR=1
heroku config:add METEOR_APP_DIR=api/
heroku config:add METEOR_SETTINGS="$(cat $PATH_TO_settings.json)"
heroku config:add MONGODB_URI=$URL_TO_mLab_INSTANCE
heroku config:add ROOT_URL=https://simpleride.herokuapp.com # in case you're using existing Heroku instance 'simpleride'
```

