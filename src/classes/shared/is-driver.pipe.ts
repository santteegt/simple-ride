import { Pipe, PipeTransform } from '@angular/core';
import { Meteor } from 'meteor/meteor';
 
import { User, Person } from '../../../api/both/models/user.model';
import { DRIVER_STATUS } from '../../../api/both/models/driver-status.model';
 
@Pipe({
  name: 'isDriver'
})
export class IsDriverPipe implements PipeTransform {
  transform(user: User): boolean {
    return (user && user['personData'] && user['personData'].isDriver && user['driverData'] && user['driverData'].status && user['driverData'].status != DRIVER_STATUS.DISABLED);
  }
}