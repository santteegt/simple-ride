import { Meteor } from 'meteor/meteor';
import { _ } from 'underscore';

import { Users } from '../../both/collections/users.collection';

import { USER_STATUS } from '../../both/models/user-status.model';
import { DRIVER_STATUS } from '../../both/models/driver-status.model';
import { DOCTYPES } from '../../both/models/image.model';

Meteor.methods({
  	getVerifingUsers: function () {	
	  	if(Meteor.isServer) {
		  	let users = Users.find({
		  		$or: [
		  		{'personData.status': USER_STATUS.UPLOADED_DNI},
		  		{'driverData.status': DRIVER_STATUS.UPLOADED_LICENSE}
	  		]}).fetch();
		  	return {status:200, message: 'OK', users: users};
  		}
	},
 	updateUserStatus: function(user_id: string, doc_type: number, approve: boolean){
		let status = '';
		if(Meteor.isServer) {
			switch(doc_type){
				case DOCTYPES.DNI: 	
					status = approve ? USER_STATUS.VERIFIED : USER_STATUS.UNVERIFIED_DNI;
					Users.update({'_id': user_id}, {$set: { 
						'personData.status': status
					}});
					break;
				case DOCTYPES.LICENSE:
					status = approve ? DRIVER_STATUS.UNVERIFIED_REGISTER : DRIVER_STATUS.UNVERIFIED_LICENSE;
					Users.update({'_id': user_id}, {$set: {
						'driverData.status': status
					}});
					break;
				case DOCTYPES.CAR_REGISTER:
					status = approve ? DRIVER_STATUS.VERIFIED : DRIVER_STATUS.UNVERIFIED_REGISTER;
					Users.update({'_id': user_id}, {$set: { 
						'driverData.status': status
					}});
					break;
				default: break;
			}
			return {status: 200, message: 'OK'};
 		}
 	}
});