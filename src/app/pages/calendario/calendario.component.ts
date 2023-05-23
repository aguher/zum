import { Component, ChangeDetectionStrategy } from "@angular/core";
import { ViewEncapsulation } from "@angular/core";

import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  DAYS_OF_WEEK,
} from "angular-calendar";
import { WeekDay } from "calendar-utils";
import { Subject } from "rxjs";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { ApiService } from "app/services/api.service";

const colors: any = {
  red: {
    primary: "#ad2121",
    secondary: "#FAE3E3",
  },
  blue: {
    primary: "#1e90ff",
    secondary: "#D1E8FF",
  },
  yellow: {
    primary: "#e3bc08",
    secondary: "#FDF1BA",
  },
};
@Component({
  selector: "mwl-demo-component",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "calendario.component.html",
  styleUrls: ["./calendario.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarioComponent {
  router;
  view: string = "month";
  refresh: Subject<any> = new Subject();
  articleInfo = undefined;
  viewDate: Date = new Date();
  activeDayIsOpen: boolean = false;
  locale: string = "es";
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  constructor(
    private route: ActivatedRoute,
    private _api: ApiService,
    private _router: Router
  ) {
    this.router = _router;
  }
  ngOnInit() {
    let idArticle = undefined;
    this.route.paramMap.subscribe((params: ParamMap) => {
      idArticle = params.get("id_article");
    });

    this._api.getAllEventReservations(idArticle).subscribe((response) => {
      if (response.status === "ok") {
        this.articleInfo = response.article_selected
          ? `${response.article_selected.brand} - [${response.article_selected.code}] ${response.article_selected.description}`
          : undefined;
        response.reservations.forEach((reserve) => {
          this.events.push({
            title: reserve.article,
            subconcept: reserve.subconcept,
            campaign: reserve.campaign,
            amount: reserve.amount,
            customer: reserve.customer,
            color: this.generateRandomColor(),
            start: new Date(reserve.start_date_reservation),
            end: new Date(reserve.end_date_reservation),
          } as any);
        });
        this.refresh.next();
      }
    });
  }
  goToCampaign(event) {
    this.router.navigate([`/desglose/${event.campaign}`]);
  }
  eventTimesChanged({ event, newStart, newEnd }: any): void {
    console.log("eventTimesChanged Event", event);
    console.log("eventTimesChanged New Times", newStart, newEnd);
    let ev = this.events.find((e: any) => e.id === event.id);
    ev.start = newStart;
    ev.end = newEnd;
    this.refresh.next();
  }
  events: CalendarEvent[] = [];

  getMonth(value) {
    switch (value) {
      case "1":
        return "Ene";
      case "2":
        return "Feb";
      case "3":
        return "Mar";
      case "4":
        return "Abr";
      case "5":
        return "May";
      case "6":
        return "Jun";
      case "7":
        return "Jul";
      case "8":
        return "Ago";
      case "9":
        return "Sep";
      case "10":
        return "Oct";
      case "11":
        return "Nov";
      case "12":
        return "Dic";
    }
  }
  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log("Event clicked", event);
  }
  dayClicked({ day }: { day: WeekDay }): void {
    this.viewDate = day.date;
    this.activeDayIsOpen = true;
  }

  generateRandomColor() {
    let maxVal = 0xffffff; // 16777215
    let randomNumber: any = Math.random() * maxVal;
    randomNumber = Math.floor(randomNumber);
    randomNumber = randomNumber.toString(16);
    let randColor = randomNumber.padStart(6, 0);
    return `#${randColor.toUpperCase()}`;
  }
}
