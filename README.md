# simple-ride

Webapp for the Simple Ride platform based on Ionic 3.x.x and Meteor framework >1.4 as backend

## Prerequisites

* NPM ([How-to](https://nodejs.org/en/))
* Meteor ([How-to](https://www.meteor.com/install))
* Meteor Client Bundler -> Install it running the command `npm install -g meteor-client-bundler`
* Ionic ([How-to](https://ionicframework.com/getting-started/))
* Android SDK with tools 25.1.6 and platform-tools 25.0.1

## Deploy/Build app for production


### Backend Setup

* Configure Server IP address in the `api/package.json` script accordingly

* Execute the following command

```
npm run api # Configure api script parameters accordingly in the packages.json file
```

### Mobile app setup

* After cloning the repo, run the following command:

```
npm install
```

* In order to run the app on a mobile device or build the app in production mode, you **MUST** temporarily remove the following packages in the Meteor backend. **REMEMBER** to discard those changes before deploying the backend

```
cd api
meteor remove angular2-compilers barbatus:angular2-polyfills
meteor add ecmascript
cd ..
npm run meteor-client:bundle # Configure meteor-client.config.json accordingly
ionic cordova run [android|ios] # run on a connected device
ionic cordova run [android|ios] --prod --release # run on a connected device for production testing
```

* `uint8` and `uint32` gives problems on some browsers. To avoid this, comment these lines on `node_modules/meteor-client.js`

```
_require('core-js/modules/es6.typed.uint8-array'); // 56
_require('core-js/modules/es6.typed.uint32-array'); // 57
```

## MongoDB Backup

* To **manually** backup the mongodb schema see this [instructions](https://github.com/xpressabhi/mup-data-backup)

#### Android setup

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

### Run the mobile app locally

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

Finally, to start serving the mobile app in your local machine, run the following command:

```
ionic serve # run on the desktop

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
