import { Pipe, PipeTransform } from '@angular/core';
 
import { User } from '../../shared/models';
 
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