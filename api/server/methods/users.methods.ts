import { Meteor } from 'meteor/meteor';
import { _ } from 'underscore';

import { Users } from '../../both/collections/users.collection';
import { UserPlaces } from '../../both/collections/user-places.collection';

import { USER_STATUS } from '../../both/models/user-status.model';
import { DRIVER_STATUS } from '../../both/models/driver-status.model';
import { DOCTYPES } from '../../both/models/image.model';

Meteor.methods({
  getVerifingUsers: function () {
	  	if(Meteor.isServer) {
		  	let users = Users.find({
		  		$or: [
		  		{'personData.status': USER_STATUS.UPLOADED_DNI},
          {'driverData.status': DRIVER_STATUS.UNVERIFIED},
          {'driverData.status': DRIVER_STATUS.UPLOADED_ONE},
          {'driverData.status': DRIVER_STATUS.UPLOADED_TWO},
          {'driverData.status': DRIVER_STATUS.VERIFIED_ONE}
	  		]}).fetch();
		  	return {status:200, message: 'OK', users: users};
  		}
	},
 	updateUserStatus: function(user_id: string, doc_type: number, approve: boolean){
		if(Meteor.isServer) {
      let status = '';
      let user: any;
      user = Users.findOne({'_id': user_id});
			switch(doc_type){
				case DOCTYPES.DNI:
					status = approve ? USER_STATUS.VERIFIED : USER_STATUS.UNVERIFIED_DNI;
					Users.update({'_id': user_id}, {$set: {
						'personData.status': status
					}});
					break;
				case DOCTYPES.LICENSE:
        case DOCTYPES.CAR_REGISTER:
          if( approve ) {
            if( user.driverData.status == DRIVER_STATUS.UPLOADED_ONE || user.driverData.status == DRIVER_STATUS.UPLOADED_TWO ){
              status = DRIVER_STATUS.VERIFIED_ONE;
            }else if( user.driverData.status == DRIVER_STATUS.VERIFIED_ONE ) {
              status = DRIVER_STATUS.VERIFIED;
            }
          }else{
            if( user.driverData.status == DRIVER_STATUS.UPLOADED_ONE ) {
              status = DRIVER_STATUS.UNVERIFIED;
            }else if( user.driverData.status == DRIVER_STATUS.UPLOADED_TWO ) {
              status = DRIVER_STATUS.UPLOADED_ONE;
            }else if( user.driverData.status == DRIVER_STATUS.VERIFIED_ONE ) {
              status = DRIVER_STATUS.VERIFIED_ONE;
            }
          }
					Users.update({'_id': user_id}, {$set: {
						'driverData.status': status
					}});
					break;
				default: break;
			}
			return {status: 200, message: 'OK'};
 		}
  },
  addUserPlace: function(user_id: string, item: any){
    if(Meteor.isServer) {
      let placeExists = UserPlaces.find({
        'user_id': user_id,
        'place_id': item.place_id
      });
      if(placeExists.fetch().length == 0) {
        UserPlaces.insert({
          user_id: user_id,
          place_id: item.place_id,
          name: item.name,
          description: item.description
        });
      }
    }
    return {status: 200, message: 'OK'}
  },
  removeUserPlace: function(user_id: string, item: any){
  if(Meteor.isServer) {
    UserPlaces.remove({
      user_id: user_id,
      place_id: item.place_id
    });
    }
    return {status: 200, message: 'OK'}
  },
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
  updateUserDevice: function(user_id: String, device_type: String){
    if(Meteor.isServer){
      Users.update({_id: user_id}, {$set:{'personData.device_type': device_type}});
      return {status: 200, message: 'OK'}
    }
  }
});
