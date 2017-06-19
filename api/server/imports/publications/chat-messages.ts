import { Meteor } from 'meteor/meteor';
import { ChatMessages } from '../../../both/collections/chat-messages.collection';
 

interface Options {
  [key: string]: any;
}
 
Meteor.publish('trip-chat-messages', function(options: Options, trip_id: string) {

  	return ChatMessages.find({'trip_id': trip_id}, options);
});