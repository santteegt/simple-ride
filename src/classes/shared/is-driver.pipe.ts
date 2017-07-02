import { Pipe, PipeTransform } from '@angular/core';
 
import { User, Person } from '../../shared/models';
import { DRIVER_STATUS } from '../../shared/models';
 
@Pipe({
  name: 'isDriver'
})
export class IsDriverPipe implements PipeTransform {
  transform(user: User): boolean {
    return (user && user['personData'] && user['personData'].isDriver && user['driverData'] && user['driverData'].status && user['driverData'].status != DRIVER_STATUS.DISABLED);
  }
}