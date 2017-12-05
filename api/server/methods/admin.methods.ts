import { Meteor } from 'meteor/meteor';
import { _ } from 'underscore';

import { Push } from 'meteor/raix:push';
import { Notification, NotificationBody } from '../../both/models/notification.model';
import { Campaing } from '../../both/models/campaing.model';
import { Campaings } from '../../both/collections/campaings.collection';
import { CampaingLogs } from '../../both/collections/campaing-logs.collection';
import { User } from '../../both/models/user.model';
import { Users } from '../../both/collections/users.collection';
import { UserPlaces } from '../../both/collections/user-places.collection';

import { USER_STATUS } from '../../both/models/user-status.model';
import { DRIVER_STATUS } from '../../both/models/driver-status.model';
import { DOCTYPES } from '../../both/models/image.model';

Meteor.methods({
  isAdmin: function(user_id: String){
    if(Meteor.isServer){
      let user = Users.findOne({_id: user_id});
      if(user && user['adminData'] && user['adminData']['isAdmin']){
        return {status: 200, message: 'OK', };
      }else{
        return {status: 500, message: 'Unauthorized', };
      }
    }
  },
  getTotalUsers: function(){
    if(Meteor.isServer){
      let drivers = Users.find({"personData.isDriver": true}).fetch();
      let travellers = Users.find({$or: [{"personData.isDriver": {$exists: false}}, {"personData.isDriver": false}]}).fetch();
      return {status: 200, message: 'OK', users: {totalDrivers: drivers.length, totalTravellers: travellers.length}}
    }
  },
  addCampaing: function(audience: string, title: string, message: string){
    if(Meteor.isServer){
      Campaings.insert({
        audience: audience,
        title: title,
        message: message,
        total_sent: 0,
        active: true
      });
      return {status: 200, message: 'OK'}
    }
  },
  deleteCampaing: function(campaing_id: string){
    if(Meteor.isServer){
      Campaings.update({_id: campaing_id}, {$set: {active: false}});
      return {status: 200, message: 'OK'}
    }
  },
  sendCampaing: function(campaing_id: string){
    if(Meteor.isServer){
      let campaing = Campaings.findOne({'_id': campaing_id});
      let sendedUsers = CampaingLogs.find({'campaing_id': campaing_id}).fetch().map(function(campaing){
        return campaing.user_id;
      });
      let userList;
  		if(campaing.audience=='all'){
  			userList = Users.find({'_id': {$nin: sendedUsers}}).fetch();
  		}else if(campaing.audience=='drivers'){
  			userList = Users.find({"personData.isDriver":true, '_id': {$nin: sendedUsers}}).fetch();
  		}else{
  			userList = Users.find({$or: [{"personData.isDriver": {$exists: false}}, {"personData.isDriver": false}], '_id': {$nin: sendedUsers}}).fetch();
  		}
      let inserted = 1;
    	if(userList.length > 0) {
  		_.each(userList, (user: User) => {

        Campaings.update({_id: campaing._id}, {$set: {total_sent: campaing.total_sent + inserted}});
        inserted++;
        CampaingLogs.insert({
          campaing_id: campaing._id,
          user_id: user._id,
          sent_date: new Date()
        });

  			let push_body: NotificationBody = {
  		      title: campaing.title,
  		      text: campaing.message,
  		      from: 'server',
  		      badge: 1,
  		      query: {userId: user._id}
  		    }
  		    Push.send(push_body);
  			});
  		}
      return {status: 200, message: 'OK'}
    }
  }
});
