import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
// TODO:
// import { Meteor } from 'meteor/meteor';
// import { InjectUser } from "angular2-meteor-accounts-ui";
// import { _ } from 'underscore';
declare var Meteor;
declare var _;
import { NavController, NavParams, ViewController, AlertController,
		LoadingController, PopoverController, ModalController, Content} from 'ionic-angular';
import { Observable, Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs"
import { Keyboard } from '@ionic-native/keyboard';

import { TripUtils } from '../../classes/trip-utils.class';
import { IsDriverPipe } from '../../classes/shared/is-driver.pipe';

import { Trip, ChatMessage, MESSAGETYPES } from '../../shared/models';
import { ChatMessages} from '../../shared/collections';


interface ServerResponse {
	status: number;
	message: string;
}

@Component({
  selector: 'message-board',
  templateUrl: 'trip-message-board.component.mobile.html',
  providers: [IsDriverPipe],
})
// TODO:
// @InjectUser('user')
export class TripMessageBoardMobileComponent implements OnInit, OnDestroy {

	@ViewChild('messageInput') messageInput;
	@ViewChild(Content) content: Content;


	isPushNav: boolean;

	trip: Trip;

	messagesSub: Subscription;
	messagesObs: Observable<ChatMessage[]>;

	tripUtils = TripUtils;

	loader;

	message: string;

	pushNotifIsDriver: boolean;
	loadingImgs: any;

	user: any;
	readOnly: boolean;

	constructor(private navCtrl: NavController, navParams: NavParams, private viewCtrl: ViewController,
		private alertCtrl: AlertController, private loadingCtrl: LoadingController,
		private modalCtrl: ModalController, private popoverCtrl: PopoverController, private isDriverPipe: IsDriverPipe, private keyboard: Keyboard) {

		this.trip = navParams.get("trip");
		this.isPushNav = navParams.get("isPushNav");
		this.readOnly = navParams.get("readOnly");
		this.pushNotifIsDriver = navParams.get("push_is_driver");
		this.loadingImgs = {};
		this.keyboard.hideKeyboardAccessoryBar(true);
	}

	ngOnInit() {

		MeteorObservable.autorun().subscribe(() => {
      this.user = Meteor.user();
    });

		if (this.messagesSub) {
			this.messagesSub.unsubscribe();
		}

		this.messagesSub = MeteorObservable.subscribe('trip-chat-messages', {sort: {'message_date': 1}}, this.trip._id).subscribe(() => {

			this.messagesObs = ChatMessages.find({}).zone();

		});

	}

	ionViewDidEnter() {
		let dimensions = this.content.getContentDimensions();
        this.content.scrollTo(0, dimensions.scrollHeight, 500);
	}

	ngOnDestroy() {
		this.messagesSub.unsubscribe();
		this.keyboard.hideKeyboardAccessoryBar(false);
	}

	sendMessage(event: MouseEvent) {

		event.preventDefault();

		let today = new Date();
		let hour = today.getHours() < 10 ? '0' + today.getHours():today.getHours();
		let minutes = today.getMinutes() < 10 ? '0' + today.getMinutes():today.getMinutes();
		let is_driver = this.trip.driver_id == Meteor.userId();
  		ChatMessages.insert({
			trip_id: this.trip._id,
			user_id: Meteor.userId(),
			user_forename: Meteor.user()['personData']['forename'],
			user_surname: Meteor.user()['personData']['surname'],
			user_profileImg: Meteor.user()['personData']['profileImg'],
			is_driver: is_driver,
			message_type: MESSAGETYPES.USER,
			message_date: today,
			message_time: hour + ':' + minutes,
			message: this.message

  		});

  		MeteorObservable.call('notify', Meteor.userId(), this.trip._id, is_driver).subscribe((response: ServerResponse) => {
  			// nothing to do
  		});

  		this.message = '';
  		this.messageInput.setFocus();
  		let dimensions = this.content.getContentDimensions();
        this.content.scrollTo(0, dimensions.scrollHeight, 0);

	}

	loadedImg(id: string) {
		this.loadingImgs[id] = true;
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}
}
