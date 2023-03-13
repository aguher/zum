import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CalendarEvent,DAYS_OF_WEEK } from 'angular-calendar';
import {WeekDay} from 'calendar-utils';  
const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};
@Component({
  selector: 'mwl-demo-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'calendario.component.html'
})
export class CalendarioComponent {
  view: string = 'month';

  viewDate: Date =new Date();
  activeDayIsOpen: boolean = false;
  locale: string = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;


  events: CalendarEvent[] = [
    {
      title: 'NG Consulting - 3 toallas',
      color: colors.yellow,
      start: new Date('2023-03-01'),
      end:new Date('2023-03-04'),
      allDay: true
    },
    {
      title: 'A non all day event',
      color: colors.blue,
      start: new Date('2023-03-03'),
    }
  ];

  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log('Event clicked', event);
  }
  dayClicked({ day }: { day: WeekDay }): void {
    this.viewDate = day.date;
    this.activeDayIsOpen = true;
  }

}