import { Component, LOCALE_ID, Injectable } from '@angular/core';
import { CommonModule, registerLocaleData, formatDate } from '@angular/common';
import localeRo from '@angular/common/locales/ro';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { 
    CalendarView, 
    CalendarEvent,
    CalendarPreviousViewDirective,
    CalendarNextViewDirective,
    CalendarTodayDirective,
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent,
    CalendarDateFormatter,
    DateFormatterParams
} from 'angular-calendar';

// Înregistrăm limba română în Angular
registerLocaleData(localeRo, 'ro');

// Clasă pentru suprascrierea formatelor default de oră (AM/PM -> 24h)
@Injectable()
export class CustomDateFormatter extends CalendarDateFormatter {
  
  // Format pentru coloana de ore din vizualizarea "Săptămână"
  public override weekViewHour({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'HH:mm', locale || 'ro');
  }

  // Format pentru coloana de ore din vizualizarea "Zi"
  public override dayViewHour({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'HH:mm', locale || 'ro');
  }
}

@Component({
    selector: 'app-fleet-calendar',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatButtonToggleModule,
        // Directive pentru navigația în timp (butoanele)
        CalendarPreviousViewDirective,
        CalendarNextViewDirective,
        CalendarTodayDirective,
        // Componentele vizuale (tag-urile <mwl-...>)
        CalendarMonthViewComponent,
        CalendarWeekViewComponent,
        CalendarDayViewComponent
    ],
    // Adăugăm LOCALE_ID în providers pentru a seta limba implicită
    providers: [
        { provide: LOCALE_ID, useValue: 'ro' },
        // Îi spunem calendarului să folosească formatatorul customizat
        { provide: CalendarDateFormatter, useClass: CustomDateFormatter }
    ],
    templateUrl: './fleet-calendar.component.html',
    styleUrls: ['./fleet-calendar.component.scss']
})
export class FleetCalendarComponent {
    // Setup-ul inițial pentru calendar
    public view: CalendarView = CalendarView.Week;
    public CalendarView = CalendarView; // Expunem enum-ul către HTML
    public viewDate: Date = new Date(); // Data de azi

    // Variabilă de limbă pe care o vom trimite către HTML
    public locale: string = 'ro';

    // Momentan lăsăm array-ul gol. Îl vom umple cu date de la backend.
    public events: CalendarEvent[] = [];

    // Metodă schimbare vizualizare (lună/saptămână/zi)
    public setView(view: CalendarView) {
        this.view = view;
    }
}