import { Pipe, PipeTransform } from '@angular/core';
import { Meteor } from 'meteor/meteor';
 
import { User, Person } from '../../../api/both/models/user.model';
 
@Pipe({
  name: 'displayImage'
})
export class DisplayImagePipe implements PipeTransform {
  transform(user: User): string {
    if (user && user['personData'] && user['personData'].profileImg) {
      return user['personData'].profileImg;
    }
    
    return '';
  }
}