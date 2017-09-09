import { Pipe, PipeTransform } from '@angular/core';

import { User } from '../../shared/models';

@Pipe({
  name: 'isUserIncomplete'
})
export class IsUserIncompletePipe implements PipeTransform {

  transform(user: User): boolean {
  	return user && user['personData'] && 
  	(user['personData'].typeid == '' || user['personData'].dni == '' || user['personData'].phone == '' 
  		// || user['personData'].conversation == '' 
  		// || user['personData'].country == '' || user['personData'].state == '' || user['personData'].city == ''
  	)
  }
}
