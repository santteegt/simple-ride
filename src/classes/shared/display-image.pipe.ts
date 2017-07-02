import { Pipe, PipeTransform } from '@angular/core';

import { User, Person } from '../../shared/models';
 
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