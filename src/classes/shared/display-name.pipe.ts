import { Pipe, PipeTransform } from '@angular/core';
import { Meteor } from 'meteor/meteor';
 
import { User, Person } from '../../../api/both/models/user.model';
 
@Pipe({
  name: 'displayName'
})
export class DisplayNamePipe implements PipeTransform {
  transform(user: User): string {
    if (user && user['personData'] && user['personData'].forename) {
      return user['personData'].forename;
    }

    return '';
  }
}