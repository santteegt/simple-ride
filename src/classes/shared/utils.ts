import { Meteor } from 'meteor/meteor';

export class Utils{
  public dateToString(date: Date): string {
    let mm = date.getMonth() + 1;
    let dd = date.getDate();

    return [date.getFullYear(),
      (mm>9 ? '' : '0') + mm,
      (dd>9 ? '' : '0') + dd
    ].join('-');
  }

  public stringToDate(date: string): Date{
    return new Date(date.split('-').reverse().join());
  }
}
