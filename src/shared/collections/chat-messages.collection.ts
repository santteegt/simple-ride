import { MongoObservable } from 'meteor-rxjs';
// TODO:
// import { Meteor } from 'meteor-client';

import { ChatMessage } from '../models/chat-message.model';
 
export const ChatMessages = new MongoObservable.Collection<ChatMessage>('chatmessages');

function loggedIn() {
  return !!Meteor.user();
}

 
ChatMessages.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: () => {return false;}
});