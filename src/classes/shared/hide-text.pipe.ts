import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hideText'
})
export class HideTextPipe implements PipeTransform {
  transform(text: string, start?: number, symbol?: string): string {
    let hidden = '';
    if(!start){
      start = 0;
    }
    for(let i=0; i<text.length-start; i++){
      hidden += symbol ? symbol : 'X';
    }
    return text.substring(0,start) + hidden;
  }
}
